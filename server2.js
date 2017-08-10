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
        var bodyParser = require("body-parser");
        var http = require("http");
        var morgan = require("morgan");
        var path = require("path");
        var mysql = require("mysql");
        var bcrypt = require("bcryptjs");
        var Redis = require("ioredis");
        var cookies = require("cookies");
        
        var func = require("./extras/func.js");

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
        var connection = mysql.createConnection({
            host     : "localhost",
            user     : "messenger",
            password : "Anp82iVRWHEyaEn1",
            database : "messenger"
        });
        var redis = new Redis();
        
        

        //************************************************
        // Routes
        //************************************************
        var sFileIndex = path.join(__dirname + "/public/index.html");
        var sFileLogin = path.join(__dirname + "/public/login.html");
        var sFileRegister = path.join(__dirname + "/public/register.html");
        var sFileNachrichten = path.join(__dirname + "/public/messages.html");
         
            //************************************************
            // Alles hinter diesem Kommentar ist für die Hauptseite verantwortlich.
            //************************************************
        app.get("/", function (req, res) {
            console.log(sFileIndex);
            res.sendFile(sFileIndex);
        });
        
            //************************************************
            // Alles hinter diesem kommentar ist für die Loginseite verantwortlich.
            //************************************************
        app.get("/login", function (req, res) {
            console.log(sFileLogin);
            res.sendFile(sFileLogin);
        });
        
        app.post("/loginUser", function (req, res) { //Start des Einloggen
            var user = req.body.inputUser;
            var iPassword = req.body.inputPW;
            var sQuery = "SELECT * FROM userdata WHERE username = \"" + user + "\";";
            
            connection.query(sQuery, function (error, results, fields){ //Passwortüberprüfung
                if (error) throw error;
                console.log('The solution is: ', results[0].user_password);
                var sHash = results[0].user_password;
                if (!bcrypt.compareSync(iPassword, sHash)) {
                    res.send("Benutzername oder Passwort falsch!");
                } else {
                    func.login(new cookies (req, res), {
                        "login": true,
                        "userid": results[0].id,
                    });
                    res.sendFile(sFileNachrichten);
                }
            });
        });
        
        app.get("/messenger", function (req, res) {
            func.loggedin(new cookies (req, res), function (iUserid) {
                console.log(iUserid);
                if (iUserid > -1) {
                    console.log(iUserid);
                    res.sendFile(sFileNachrichten);
                    var sQuery = "SELECT * FROM userdata WHERE id = " + iUserid + ";";
                    connection.query(sQuery, function (error, result, fields) {
                        console.log("Hallo User " + result[0].username + "! Du hast die UserID " + iUserid + "!");
                    });
                } else {
                    res.sendFile(sFileIndex);
                }
            });
        });
        
        // Der Logout
        app.get("/logout", function (req, res) {
            var oCookies = cookies(req, res);
            func.logout(new cookies(req, res), {
                "sessionid": oCookies.get("MESSENGER")
            });
            res.sendFile(sFileIndex);
        });
        
            //************************************************
            // Alles hinter diesem Kommentar ist für die Registrierungsseite verantwortlich.
            //************************************************
        app.get("/register", function (req, res) {
            console.log(sFileRegister);
            res.sendFile(sFileRegister);
        });

        app.post("/newUser", function (req, res) { //Start der Werteprüfung
            var user = req.body.inputUser;
            var email = req.body.inputEmail;
            var iPassword = req.body.inputPW;
            var rPassword = req.body.repeatPW;
            var agb = false;
            if (req.body.agb !== undefined) {
                agb = true;
            }
            var error = func.registerPruf(user, email, iPassword, rPassword, agb);
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                var salt = bcrypt.genSaltSync(10); // Passwort verschlüsseln
                var hash = bcrypt.hashSync( iPassword, salt);
                var sQuery = "INSERT INTO userdata ( username, user_password, user_email ) VALUES ( \"" + user + "\", \"" + hash + "\", \"" + email + "\");" // Einfügen der Daten in eine Userdatenbank
                connection.query(sQuery);
                res.sendFile(sFileLogin);
            }
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