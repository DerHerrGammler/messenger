"use strict";

//************************************************
// Dependencies
//************************************************
var config = require("../../static/config.json");
var dbhandler = require("../../holzmannspace/dbhandler")(config, require("../../static/dbcursor.json"));
var projecthelper = require("../../projecthelper");
var classes = require("../../classes");
var bcrypt = require("bcryptjs");
var Cookies = require("cookies");
var helper = require("../../holzmannspace/helper")(config);
var enums = helper.getEnums();
var errorcode = helper.getErrorcodes();

//************************************************
// Module
//************************************************
exports.post = function (req, res) {
    var oUser = new classes.user();
    helper.checkRequiredValues([
        [req.body.username, "Username"],
        [req.body.password, "Password"]
    ])
        .then(function () {
            return dbhandler.fetch("FetchUserUsername", [req.body.username]);
        })
        .then(function (aUsers) {
            if (aUsers.length === 0) {
                throw {
                    "type": errorcode.ERR_indiviudalerror,
                    "message": "Wrong username or password"
                };
            }
            oUser = new classes.user(aUsers[0]);
            return helper.checkUserlevel({
                "userlevel": oUser.getUserlevel(),
                "requiredlevel": enums.UserlevelMember
            });
        })
        .then(function () {
            return bcrypt.compare(req.body.password, oUser.getPassword());
        })
        .then(function (bcryptRes) {
            if (bcryptRes === false) {
                throw {
                    "type": errorcode.ERR_indiviudalerror,
                    "message": "Wrong username or password"
                };
            }
            return helper.startSession(new Cookies(req, res), {
                "login": true,
                "userid": oUser.getUserid(),
                "cookie": helper.isset(req.body.cookie)
            });
        })
        .then(function () {
            res.json({
                "meta": {
                    "status": enums.StatusOK,
                    "message": ""
                },
                "response": {
                    "user": req.body.oUser.toJSON()
                }
            });
        })
        .catch(function (oError) {
            res.json(projecthelper.errorHandler(oError));
        });
};