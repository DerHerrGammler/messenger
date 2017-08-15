"use strict"

// Module dependencies

var cookies = require("cookies");
var Redis = require("ioredis");

// configuration

var redis = new Redis();

//****************************************
// function
//****************************************

exports.registerPruf = function (sUser, sEmail , sPasswordI, sPasswordR, bAgb) {   
    if (sUser.length > 0) {
        if (sPasswordI.length > 5) {
            if (sPasswordI.match(/[a-z]/)) {
                if (sPasswordI.match(/[A-Z]/)) {
                    if (sPasswordI.match(/\d/)) {
                        if (sPasswordI.match(/\W/)) {
                            if (sPasswordI === sPasswordR) {
                                if (bAgb) {
                                    return;
                                } else {
                                    return "- AGBs müssen akzeptiert sein -";
                                }
                            } else {
                                return "- Passwort Wiederholung Falsch -";
                            }
                        } else {
                            return "- Passwort braucht min. 1 Sonderzeichen -";
                        }
                    } else {
                        return "- Passwort braucht min 1 Zahl -";
                    }
                } else {
                    return "- Passwort braucht min. 1 Großbuchstaben -";
                }
            } else {
                return "- Passwort brauch min. 1 Kleinbuchstaben -";
            }
        } else {
            return "- Passwort zu kurz -";
        }
    } else {
        return "- Benutzername zu kurz -";
    }
}

exports.login = function (oCookie, oOption) {
    if (oOption.login) {
        var sSessionid = exports.randomString(16, "aA#");
        oCookie.set("MESSENGER", sSessionid, {
            "overwrite": true,
            "httpOnly": true,
        });
        redis.set(sSessionid, oOption.userid);
    }
}

exports.logout = function (oCookie, oOption) {
    if (oOption.sessionid !== undefined) {
        /* old code  !!!FEHLERMELDUNG und cookie wird nicht entfernt!!!
        redis.del(oOption.sessionid, function() {
            oCookie.set("MESSENGER");
        });
        */
        redis.del(oOption.sessionid);
        oCookie.set("MESSENGER");
    }
}

exports.loggedin = function (oCookie, fCallback) {
    var bReturn = -1;
    var sSessionid = oCookie.get("MESSENGER");
    redis.get(sSessionid, function (error, result) {
        if (!error && result !== null) {
            bReturn = result;
        }
        fCallback(bReturn);
    });
}

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

exports.route = function (res, sRoute) {
    res.redirect(sRoute);
}

exports.unixInt = function () {
    return Math.floor(Date.now() / 1000);
};

exports.unixDate = function (iTime) {
    var iDate = new Date(iTime * 1000);
    var aMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var iYear = iDate.getFullYear();
    var sMonth = aMonth[iDate.getMonth()];
    var iDay = iDate.getDate();
    var iHour = iDate.getHours();
    var iMinute = iDate.getMinutes();
    var iSecound = iDate.getSeconds();
    if (iDay < 10) {
        iDay = "0" + iDay;
    }
    if (iHour < 10) {
        iHour = "0" + iHour;
    }
    if (iMinute < 10) {
        iMinute = "0" + iMinute;
    }
    if (iSecound < 10) {
        iSecound = "0" + iSecound;
    }
    var sDate = iDay + ". " + sMonth + " " + iHour + ":" + iMinute + ":" + iSecound;
    return sDate;
};

