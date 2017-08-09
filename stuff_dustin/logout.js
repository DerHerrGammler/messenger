"use strict";

//************************************************
// Dependencies
//************************************************
var config = require("../../static/config.json");
var projecthelper = require("../../projecthelper");
var classes = require("../../classes");
var Cookies = require("cookies");
var helper = require("../../holzmannspace/helper")(config);
var enums = helper.getEnums();

//************************************************
// Module
//************************************************
exports.get = function (req, res) {
    helper.endSession(new Cookies(req, res), {
        "sessionid": req.clientdata.sessionid
    })
        .then(function () {
            req.body.oUser = new classes.user();
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