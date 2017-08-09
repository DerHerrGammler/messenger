"use strict"

// Module dependencies

var cookies = require("cookies");


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
    }
}

exports.logout = function (oCookie, oOption) {
    if (oOption.sSessionid)
}

exports.loggedin = function () {
    
}

exports.randomString = function (iLength, sChars, oOption) {
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