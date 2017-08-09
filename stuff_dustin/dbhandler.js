"use strict";

//************************************************
// Module dependencies
//************************************************
var mysql = require("mysql");
var connection;
var config;
var dbcursor;
var helper;
var errorcode;

module.exports = function (oConfig, oCursor) {
    config = oConfig;
    dbcursor = oCursor;
    helper = require("./helper")(config);
    errorcode = helper.getErrorcodes();

    if (config.mysql.enabled) {
        connection = mysql.createConnection({
            host: "localhost",
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database
        });
        connection.connect();
    }

    return exports;
};

//************************************************
// Exports
//************************************************
exports.fetch = function (sCursor, aParams) {
    return new Promise(function (fFulfill, fReject) {
        var sSQL = sCursor;
        var iParams = 0;
        var iValues = 0;
        var aSQLSplit = [];
        var iPosition = 0;
        var sNewSQL = "";
        var aRows = [];
        if (helper.isset(dbcursor[sCursor])) {
            sSQL = dbcursor[sCursor];
        }
        if (aParams !== undefined) {
            iParams = aParams.length;
        }
        var i = 0;
        var a = 0;
        while (i < iParams) {
            if (typeof aParams[i] === "object") {
                iValues = aParams[i].length;
                if (iValues > 0) {
                    aSQLSplit = sSQL.split(" ");
                    iPosition = aSQLSplit.indexOf("'@" + i + "'");
                    sNewSQL = "";
                    a = 0;
                    while (a < iValues) {
                        sNewSQL += aSQLSplit[iPosition - 2] + " " + aSQLSplit[iPosition - 1] + " '" + aParams[i][a] + "' OR ";
                        a += 1;
                    }
                    sNewSQL = "(" + sNewSQL.substr(0, sNewSQL.length - 4) + ")";
                    sSQL = sSQL.replace(aSQLSplit[iPosition - 2] + " " + aSQLSplit[iPosition - 1] + " " + aSQLSplit[iPosition], sNewSQL);
                } else {
                    fFulfill(aRows);
                    return;
                }
            } else {
                sSQL = sSQL.replace(new RegExp("@" + i, "g"), aParams[i]);
            }
            i += 1;
        }
        if (config.mysql.enabled) {
            connection.query(sSQL, function (err, rows) {
                if (!err) {
                    aRows = rows;
                    fFulfill(aRows);
                } else {
                    fReject({
                        "arguments": {
                            "sCursor": sCursor,
                            "aParams": aParams,
                            "sQuery": sSQL
                        },
                        "type": errorcode.ERR_sqlfetcherror,
                        "message": "Error in SQL-Fetch"
                    });
                }
            });
        } else {
            fFulfill(aRows);
        }
    });
};

exports.insert = function (oDBClass, oOptions) {
    oOptions = oOptions || {};
    oOptions.prefix = oOptions.prefix || "";
    oOptions.suffix = oOptions.suffix || "";
    oOptions.chars = oOptions.chars || "#a";

    return new Promise(function (fFulfill, fReject) {
        if (oDBClass === undefined || oDBClass.fields === undefined) {
            fReject("No class given for insert");
        }
        var fInsertCommit = function (oDBClass) {
            var oData = {};
            var iClassValues = Object.keys(oDBClass.fields).length;
            var sSQL = "INSERT INTO `" + oDBClass.classname + "` (";
            var i = 0;
            while (i < iClassValues) {
                sSQL += "`" + Object.keys(oDBClass.fields)[i] + "`, ";
                i += 1;
            }
            sSQL = sSQL.substr(0, sSQL.length - 2);
            sSQL += ") VALUES (";
            i = 0;
            while (i < iClassValues) {
                sSQL += "'" + oDBClass.fields[Object.keys(oDBClass.fields)[i]] + "', ";
                i += 1;
            }
            sSQL = sSQL.substr(0, sSQL.length - 2);
            sSQL += ")";
            if (config.mysql.enabled) {
                connection.query(sSQL, function (err) {
                    if (!err) {
                        exports.fetch("SELECT * FROM `@0` WHERE `@1` = '@2' LIMIT 1", [oDBClass.classname, Object.keys(oDBClass.fields)[0], oDBClass.fields[Object.keys(oDBClass.fields)[0]]])
                            .then(function (data) {
                                oData = data;
                                fFulfill(oData);
                            })
                            .catch(function (err) {
                                fReject({
                                    "err": err,
                                    "oDBClass": oDBClass,
                                    "oOptions": oOptions,
                                    "sQuery": "SELECT * FROM `" + oDBClass.classname + "` WHERE `" + Object.keys(oDBClass.fields)[0] + "` = '" + oDBClass.fields[Object.keys(oDBClass.fields)[0]] + "' LIMIT 1"
                                });
                            });
                    } else {
                        fReject({
                            "err": err,
                            "oDBClass": oDBClass,
                            "oOptions": oOptions,
                            "sQuery": sSQL
                        });
                    }
                });
            } else {
                fFulfill(oData);
            }
        };
        if (oDBClass.fields[Object.keys(oDBClass.fields)[0]].trim().length === 0) {
            var iIDLength = oDBClass.fields[Object.keys(oDBClass.fields)[0]].length;
            var sRandomID = helper.randomString(iIDLength, oOptions.chars, {
                "prefix": oOptions.prefix,
                "suffix": oOptions.suffix
            });
            helper.promiseWhile(function () {
                return oDBClass.fields[Object.keys(oDBClass.fields)[0]].trim().length === 0;
            }, function () {
                return exports.fetch("SELECT * FROM `@0` WHERE `@1` = '@2' LIMIT 1", [oDBClass.classname, Object.keys(oDBClass.fields)[0], sRandomID])
                    .then(function (data) {
                        if (data.length === 0) {
                            oDBClass.fields[Object.keys(oDBClass.fields)[0]] = sRandomID;
                        } else {
                            sRandomID = helper.randomString(iIDLength, oOptions.chars, {
                                "prefix": oOptions.prefix,
                                "suffix": oOptions.suffix
                            });
                        }
                    })
                    .catch(function (err) {
                        fReject({
                            "err": err,
                            "oDBClass": oDBClass,
                            "oOptions": oOptions,
                            "sQuery": "SELECT * FROM `" + oDBClass.classname + "` WHERE `" + Object.keys(oDBClass.fields)[0] + "` = '" + sRandomID + "' LIMIT 1"
                        });
                    });
            })
                .then(function () {
                    fInsertCommit(oDBClass);
                })
                .catch(function (err) {
                    fReject({
                        "err": err,
                        "oDBClass": oDBClass,
                        "oOptions": oOptions
                    });
                });
        } else {
            fInsertCommit(oDBClass);
        }
    });
};

exports.insertOrUpdate = function (oDBClass, oOptions) {
    oOptions = oOptions || {};
    oOptions.prefix = oOptions.prefix || "";
    oOptions.suffix = oOptions.suffix || "";
    oOptions.chars = oOptions.chars || "#a";

    return new Promise(function (fFulfill, fReject) {
        if (oDBClass === undefined || oDBClass.fields === undefined) {
            fReject("No class given for insert");
        }
        var fInsertCommit = function (oDBClass) {
            var iClassValues = Object.keys(oDBClass.fields).length;
            var sSQL = "INSERT INTO `" + oDBClass.classname + "` (";
            var i = 0;
            while (i < iClassValues) {
                sSQL += "`" + Object.keys(oDBClass.fields)[i] + "`, ";
                i += 1;
            }
            sSQL = sSQL.substr(0, sSQL.length - 2);
            sSQL += ") VALUES (";
            i = 0;
            while (i < iClassValues) {
                sSQL += "'" + oDBClass.fields[Object.keys(oDBClass.fields)[i]] + "', ";
                i += 1;
            }
            sSQL = sSQL.substr(0, sSQL.length - 2);
            sSQL += ") ON DUPLICATE KEY UPDATE ";
            i = 0;
            while (i < iClassValues) {
                sSQL += "`" + Object.keys(oDBClass.fields)[i] + "` = '" + oDBClass.fields[Object.keys(oDBClass.fields)[i]] + "', ";
                i += 1;
            }
            sSQL = sSQL.substr(0, sSQL.length - 2);
            if (config.mysql.enabled) {
                connection.query(sSQL, function (err) {
                    if (!err) {
                        exports.fetch("SELECT * FROM `@0` WHERE `@1` = '@2' LIMIT 1", [oDBClass.classname, Object.keys(oDBClass.fields)[0], oDBClass.fields[Object.keys(oDBClass.fields)[0]]])
                            .then(function (data) {
                                fFulfill(data);
                            })
                            .catch(function (err) {
                                fReject({
                                    "err": err,
                                    "oDBClass": oDBClass,
                                    "oOptions": oOptions,
                                    "sQuery": "SELECT * FROM `" + oDBClass.classname + "` WHERE `" + Object.keys(oDBClass.fields)[0] + "` = '" + oDBClass.fields[Object.keys(oDBClass.fields)[0]] + "' LIMIT 1"
                                });
                            });
                    } else {
                        fReject({
                            "err": err,
                            "oDBClass": oDBClass,
                            "oOptions": oOptions,
                            "sQuery": sSQL
                        });
                    }
                });
            } else {
                fFulfill(oDBClass);
            }
        };
        if (oDBClass.fields[Object.keys(oDBClass.fields)[0]].trim().length === 0) {
            var iIDLength = oDBClass.fields[Object.keys(oDBClass.fields)[0]].length;
            var sRandomID = helper.randomString(iIDLength, oOptions.chars, {
                "prefix": oOptions.prefix,
                "suffix": oOptions.suffix
            });
            helper.promiseWhile(function () {
                return oDBClass.fields[Object.keys(oDBClass.fields)[0]].trim().length === 0;
            }, function () {
                return exports.fetch("SELECT * FROM `@0` WHERE `@1` = '@2' LIMIT 1", [oDBClass.classname, Object.keys(oDBClass.fields)[0], sRandomID])
                    .then(function (data) {
                        if (data.length === 0) {
                            oDBClass.fields[Object.keys(oDBClass.fields)[0]] = sRandomID;
                        } else {
                            sRandomID = helper.randomString(iIDLength, oOptions.chars, {
                                "prefix": oOptions.prefix,
                                "suffix": oOptions.suffix
                            });
                        }
                    })
                    .catch(function (err) {
                        fReject({
                            "err": err,
                            "oDBClass": oDBClass,
                            "oOptions": oOptions,
                            "sQuery": "SELECT * FROM `" + oDBClass.classname + "` WHERE `" + Object.keys(oDBClass.fields)[0] + "` = '" + sRandomID + "' LIMIT 1"
                        });
                    });
            })
                .then(function () {
                    fInsertCommit(oDBClass);
                })
                .catch(function (err) {
                    fReject({
                        "err": err,
                        "oDBClass": oDBClass,
                        "oOptions": oOptions
                    });
                });
        } else {
            fInsertCommit(oDBClass);
        }
    });
};