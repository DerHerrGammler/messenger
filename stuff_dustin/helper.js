"use strict";

//************************************************
// Module dependencies
//************************************************
var errorcode = require("./errorcodes.json");
var enums = require("./enums.json");
var fs = require("fs");
var bluebird = require("bluebird");
var crypto = require("crypto");
var cookies = require("cookies");
var easyimg = require("easyimage");
var async = require("async");
var IOredis = require("ioredis");
var redis;

var config;
module.exports = function(oConfig) {
    config = oConfig;
    if (config.redis.enabled) {
        if (config.redis.socket === ".") {
            redis = new IOredis();
        } else {
            redis = new IOredis(config.redis.socket);
        }
    }
    return exports;
};


//************************************************
// Functions
//************************************************
function htmlspecialchars(sString) {
    if (typeof sString !== "string") {
        sString = String(sString);
    }
    var map = {
        "!": "&#033;",
        "\"": "&#034;",
        "$": "&#036;",
        "&": "&#038;",
        "'": "&#039;",
        "<": "&#060;",
        ">": "&#062;",
        "\\": "&#92;",
        "/": "&#47;",
        "   ": "&nbsp;&nbsp;&nbsp;&nbsp;"
    };
    return sString.replace(/[!"$&'<>\\\/\t]/g, function (m) {
        return map[m];
    });
}

//************************************************
// Exports
//************************************************
exports.getEnums = function (oAdditionalEnums) {
    oAdditionalEnums = oAdditionalEnums || {};
    return exports.merge(enums, oAdditionalEnums);
}

exports.getErrorcodes = function (oAdditionalErrorcodes) {
    oAdditionalErrorcodes = oAdditionalErrorcodes || {};
    return exports.merge(errorcode, oAdditionalErrorcodes);
}

exports.baseRedirect = function (req, res) {
    res.writeHead(404);
    res.end();
};

exports.imageResize = function (oParams) {
    return new Promise(function (fFulfill, fReject) {
        if (oParams.path === undefined) {
            fReject({
                "arguments": {
                    "oParams": oParams
                },
                "type": errorcode.ERR_missingParameters,
                "message": "Path not set"
            });
        }

        oParams.maxwidth = oParams.maxwidth || 100;
        oParams.maxheight = oParams.maxheight || 100;

        easyimg.info(oParams.path)
            .then(function (image) {
                if (image.width > oParams.maxwidth || image.height > oParams.maxheight) {
                    var iNewWidth = image.width;
                    var iNewHeight = image.height;
                    if (image.width > image.height || image.width > oParams.maxwidth) {
                        iNewWidth = oParams.maxheight;
                        iNewHeight = parseInt(image.height * iNewWidth / image.width);
                    }
                    if (image.width < image.height || image.height > oParams.maxheight) {
                        iNewHeight = oParams.maxheight;
                        iNewWidth = parseInt(image.width * iNewHeight / image.height);
                    }
                    image.width = iNewWidth;
                    image.height = iNewHeight;
                }
                easyimg.resize({
                    src: oParams.path,
                    dst: oParams.path,
                    width: image.width,
                    height: image.height
                })
                    .then(
                        function () {
                            fFulfill();
                        },
                        function (oErr) {
                            fReject({
                                "arguments": {
                                    "oParams": oParams,
                                    "oErr": oErr
                                },
                                "type": errorcode.ERR_imageResize,
                                "message": "Failed to resize image"
                            });
                        }
                    );
            }, function (oErr) {
                fReject({
                    "arguments": {
                        "oParams": oParams,
                        "oErr": oErr
                    },
                    "type": errorcode.ERR_getImageInfo,
                    "message": "Failed to get image info"
                });
            });
    });
};

exports.isNumeric = function (iNumber) {
    return !Number.isNaN(parseFloat(iNumber)) && isFinite(iNumber);
};

exports.getWeekOfMonth = function (dtDate) {
    var firstDay = new Date(dtDate.getFullYear(), dtDate.getMonth(), 1).getDay();
    return Math.ceil((dtDate.getDate() + firstDay) / 7);
};

exports.isset = function (oItem) {
    return oItem !== undefined;
};

exports.clientip = function (req) {
    var forwardedIpsStr = req.headers["x-forwarded-for"];
    var ipAddress = null;
    if (forwardedIpsStr) {
        forwardedIpsStr = forwardedIpsStr.split(",");
        ipAddress = forwardedIpsStr[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};

exports.sqlsafe = function (req, res, next) {
    try {
        Object.keys(req.body).forEach(function (key) {
            req.body[key] = htmlspecialchars(req.body[key]);
        });
        next();
    } catch (oError) {
        console.log(oError);
        res.json({
            "meta": {
                "status": enums.StatusERR,
                "message": "Error in request validation!"
            },
            "response": {}
        });
    }
};

exports.isLoggedIn = function (req, res, next) {
    var oCookies = cookies(req, res);
    var sSessionid = oCookies.get(config.logincookie);
    req.clientdata = {
        "sessionid": "",
        "userid": ""
    };
    if (sSessionid !== undefined && sSessionid.length > 0) {
        if (config.redis.enabled) {
            redis.get(sSessionid, function (oError, reply) {
                if (oError !== null) {
                    var sMessage = "Error occured while fetching redis!";
                    console.log(sMessage);
                    console.log(oError);
                    res.json({
                        "meta": {
                            "status": enums.StatusERR,
                            "message": sMessage
                        },
                        "response": {}
                    });
                } else {
                    if (reply !== null) {
                        req.clientdata = {
                            "sessionid": sSessionid,
                            "userid": reply
                        };
                    }
                    next();
                }
            });
        } else {
            var sMessage = "redis disabled. Cannot check if logged in!";
            console.log(sMessage);
            res.json({
                "meta": {
                    "status": enums.StatusERR,
                    "message": sMessage
                },
                "response": {}
            });
        }
    } else {
        next();
    }
};

exports.htmlspecialchars = function (sString) {
    return htmlspecialchars(sString);
};

exports.fileExists = function (sFile) {
    return fs.existsSync(sFile);
};

exports.sha1 = function (sValue) {
    return crypto.createHash("sha1").update(sValue).digest("hex");
};

exports.randomString = function (iLength, sChars, oOptions) {
    var sMask = "";
    var sResult = "";
    var iMaskLength = 0;
    if (oOptions === undefined) {
        oOptions = {};
    }
    if (sChars.indexOf("a") > -1) {
        sMask += "abcdefghijklmnopqrstuvwxyz";
    }
    if (sChars.indexOf("A") > -1) {
        sMask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (sChars.indexOf("#") > -1) {
        sMask += "0123456789";
    }
    if (sChars.indexOf("!") > -1) {
        sMask += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
    }
    iMaskLength = sMask.length - 1;
    if (oOptions.prefix !== undefined) {
        sResult = oOptions.prefix;
        iLength -= oOptions.prefix.length;
    }
    if (oOptions.suffix !== undefined) {
        iLength -= oOptions.suffix.length;
    }
    while (iLength > 0) {
        sResult += sMask[Math.round(Math.random() * iMaskLength)];
        iLength -= 1;
    }
    if (oOptions.suffix !== undefined) {
        sResult += oOptions.suffix;
    }
    return sResult;
};

exports.replaceAt = function (index, character, str) {
    return str.substr(0, index) + character + str.substr(index + character.length);
};

exports.checkUserlevel = function (oParams) {
    return new Promise(function (fFulfill, fReject) {
        if (oParams === undefined) {
            fReject({
                "arguments": {
                    "aValues": oParams
                },
                "type": errorcode.ERR_missingParameters,
                "message": "Parameters not set"
            });
        }
        if (oParams.userlevel === undefined || oParams.requiredlevel === undefined) {
            fReject({
                "arguments": {
                    "aValues": oParams
                },
                "type": errorcode.ERR_missingParameters,
                "message": "User level or required level not set"
            });
        }
        if (oParams.userlevel < oParams.requiredlevel) {
            fReject({
                "arguments": {
                    "aValues": oParams
                },
                "type": errorcode.ERR_invalidUserlevel,
                "message": "Invalid user level"
            });
        }
        fFulfill();
    });
};

exports.checkRequiredValues = function (aValues) {
    return new Promise(function (fFulfill, fReject) {
        var i = 0;
        var aMissingValues = [];
        var iValues = aValues.length;
        while (i < iValues) {
            if (aValues[i][0] === undefined || Object.keys(aValues[i][0]).length <= 0) {
                aMissingValues.push(aValues[i][1]);
            }
            i += 1;
        }
        if (aMissingValues.length === 0) {
            fFulfill();
        } else {
            fReject({
                "arguments": {
                    "aValues": aValues,
                    "aMissingValues": aMissingValues
                },
                "type": errorcode.ERR_checkRequiredValues,
                "message": "Check for required values failed"
            });
        }
    });
};

exports.currentTimestamp = function () {
    return Math.floor(Date.now() / 1000);
};

exports.convertKgToLbs = function (dWeight) {
    return Math.round((dWeight * 2.2046) * 100) / 100;
};

exports.convertLbsToKg = function (dWeight) {
    return Math.round((dWeight * (1 / 2.2046)) * 100) / 100;
};

exports.rand = function (iFrom, iTo) {
    return Math.floor((Math.random() * iTo) + iFrom);
};

exports.isTrue = function (oValue, bAsInteger) {
    var bIsTrue = oValue === "true" || oValue === "1" || oValue === true || oValue === 1;
    if (bAsInteger) {
        if (bIsTrue) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return bIsTrue;
    }
};

exports.setCharAt = function (str, index, chr) {
    if (index > str.length - 1) {
        return str;
    } else {
        return str.substr(0, index) + chr + str.substr(index + 1);
    }
};

exports.startSession = function (oCookies, oParams) {
    return new Promise(function (fFulfill) {
        if (oParams.login) {
            var sSessionid = exports.randomString(32, "#aA");
            if (oParams.cookie) {
                oCookies.set(config.logincookie, sSessionid, {
                    "overwrite": true,
                    "httpOnly": true,
                    "expires": new Date(Date.now() + (enums.Week * 1000))
                });
            } else {
                oCookies.set(config.logincookie, sSessionid, {
                    "overwrite": true,
                    "httpOnly": true
                });
            }
            if (config.redis.enabled) {
                redis.set(sSessionid, oParams.userid);
            }
            fFulfill();
        }
    });
};

exports.endSession = function (oCookies, oParams) {
    return new Promise(function (fFulfill) {
        if (oParams.sessionid !== undefined) {
            if (config.redis.enabled) {
                redis.del(oParams.sessionid, function () {
                    oCookies.set(config.logincookie);
                    fFulfill();
                });
            } else {
                oCookies.set(config.logincookie);
                fFulfill();
            }
        } else {
            fFulfill();
        }
    });
};

exports.merge = function (obj1, obj2) {
    var obj3 = {};
    Object.keys(obj1).forEach(function (key) {
        obj3[key] = obj1[key];
    });
    Object.keys(obj2).forEach(function (key) {
        obj3[key] = obj2[key];
    });
    return obj3;
};

exports.uniqueArray = function (aArray) {
    var oSeen = {};
    return aArray.filter(function (oItem) {
        if (oSeen.hasOwnProperty(oItem)) {
            return false;
        } else {
            oSeen[oItem] = true;
            return true;
        }
    });
};

exports.shuffleArray = function (a) {
    var i = a.length;
    var j = 0;
    var x = 0;
    while (i > 0) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
        i -= 1;
    }
};

exports.convertStringToJSON = function (sJSON, oDefault) {
    try {
        if (sJSON.length) {
            sJSON = sJSON.replace(/(?:\r\n|\r|\n)/g, "");
            oDefault = JSON.parse(sJSON);
        }
    } catch (e) {
        console.log("-----");
        console.log(e);
        console.log("-----");
        console.log("convertStringToJSON");
        console.log("-----");
        console.log(sJSON);
        console.log("-----");
        console.log(oDefault);
        console.log("-----");
    }
    return oDefault;
};

exports.convertJSONToString = function (oObject) {
    var sJSON = "";
    try {
        if (typeof oObject === "object") {
            sJSON = JSON.stringify(oObject);
            var map = {
                "'": "&#039;"
            };
            sJSON = sJSON.replace(/[']/g, function (m) {
                return map[m];
            });
        }
    } catch (e) {
        console.log("-----");
        console.log(e);
        console.log("-----");
        console.log("convertJSONToStrings");
        console.log("-----");
        console.log(sJSON);
        console.log("-----");
        console.log(oObject);
        console.log("-----");
    }
    return sJSON;
};

exports.replaceUTF8 = function (sString) {
    if (typeof sString !== "string") {
        sString = String(sString);
    }
    sString = sString.toLowerCase();
    var map = {
        "ß": "ss",
        "ä": "ae",
        "ö": "oe",
        "ü": "ue"
    };
    return sString.replace(/[ßäöü]/g, function (m) {
        return map[m];
    });
};

exports.trim = function (sString) {
    if (sString !== undefined) {
        return sString.trim();
    } else {
        return "";
    }
};

exports.clone = function (oObject) {
    if (oObject === null || typeof oObject !== "object") {
        return oObject;
    }
    var oCopy = oObject.constructor();
    Object.keys(oObject).forEach(function (key) {
        if (oObject.hasOwnProperty(key)) {
            oCopy[key] = oObject[key];
        }
    });
    return oCopy;
};

exports.replaceAll = function (sString, search, replacement) {
    return sString.replace(new RegExp(search, "g"), replacement);
};

exports.startPromiseChain = function () {
    return new Promise(function (fFulfill) {
        fFulfill();
    });
};

exports.promiseWhile = bluebird.method(function (condition, action) {
    if (!condition()) {
        return;
    }
    return action().then(exports.promiseWhile.bind(null, condition, action));
});

exports.promiseReaddir = function (sDir) {
    return new Promise(function (fFulfill, fReject) {
        fs.readdir(sDir, function (oError, aFiles) {
            if (oError) {
                fReject(oError);
            } else {
                fFulfill(aFiles);
            }
        });
    });
};

exports.promiseUnlink = function (sFile) {
    return new Promise(function (fFulfill, fReject) {
        fs.unlink(sFile, function (oError) {
            if (oError) {
                fReject(oError);
            } else {
                fFulfill();
            }
        });
    });
};

exports.promiseAsync = function (aFunctions) {
    return new Promise(function (fFulfill, fReject) {
        async.parallel(aFunctions, function (oError, oResults) {
            if (oError) {
                fReject(oError);
            } else {
                fFulfill(oResults);
            }
        });
    });
};

exports.promiseFileStats = function (sFile) {
    return new Promise(function (fFulfill, fReject) {
        fs.stat(sFile, function (oError, oStats) {
            if (oError) {
                fReject(oError);
            } else {
                fFulfill(oStats);
            }
        });
    });
};