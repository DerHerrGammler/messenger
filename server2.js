"use strict";

//************************************************
// Module dependencies
//************************************************
var os = require("os");

require("sticky-cluster")(
    function (callback) {
        //************************************************
        // Module dependencies
        //************************************************
        var express = require("express");
        var compress = require("compression");
        var http = require("http");
        var morgan = require("morgan");
        var bodyParser = require("body-parser");
        
        var site = require("./extras/sites.js");

        //************************************************
        // Configuration
        //************************************************
        var app = express();
        app.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            next();
        });
        app.use(morgan("dev"));
        app.use(express.static(__dirname + "/public"));
        app.use(bodyParser.urlencoded({
            "extended": true
        }));
        app.use(bodyParser.json());
        app.use(compress({
            "level": 9,
            "threshold": 0
        }));
        
        
        

        //************************************************
        // Routes
        //************************************************
        app.get("/", function (req, res) {
            site.index(req, res);
        });
        app.get("/home", function (req, res) {
            site.home(req, res);
        });
        app.get("/login", function (req, res) {
            site.login(req, res);
        });
        app.post("/loginUser", function (req, res) { //Start des Einloggen
            site.loginUser(req, res);
        });
        app.get("/messenger", function (req, res) {
            site.messenger(req, res);
        });
        app.get("/logout", function (req, res) {
            site.logout(req, res);
        });
        app.get("/register", function (req, res) {
            site.register(req, res);
        });
        app.post("/newUser", function (req, res) { //Start der Werteprüfung
            site.newUser(req, res);
        });

        //************************************************
        // Start server
        //************************************************
        var server = http.createServer(app);
        callback(server);
        console.log("Cluster started");
    },
    {
        concurrency: os.cpus().length, // number of workers to be forked
        port: 3000 // http port number to listen
    }
);
// Benutzername MySQL: messenger
// PW-datenbank MySQL: Anp82iVRWHEyaEn1

// TestUser-Name/PW: DeineMudda123!