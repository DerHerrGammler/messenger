"use strict"

// modeule depenencies
var http = require("http");
var path = require("path");
var mysql = require("mysql");
var bcrypt = require("bcryptjs");
var Redis = require("ioredis");
var cookies = require("cookies");
        
var func = require("./func.js");

// configuration
var connection = mysql.createConnection({
    host     : "localhost",
    user     : "messenger",
    password : "Anp82iVRWHEyaEn1",
    database : "messenger"
});
var redis = new Redis();

// file path
var sFileIndex = path.join(__dirname + "/../public/index.html");
var sFileLogin = path.join(__dirname + "/../public/login.html");
var sFileRegister = path.join(__dirname + "/../public/register.html");
var sFileNachrichten = path.join(__dirname + "/../public/messages.html");


// sites with html page
exports.home = function (req, res) {
    res.sendFile(sFileIndex);
}

exports.login = function (req, res) {
    res.sendFile(sFileLogin);
}

exports.register = function (req, res) {
    res.sendFile(sFileRegister);
}

exports.messenger = function (req, res) {
    func.loggedin(new cookies (req, res), function (iUserid) {
        if (iUserid > -1) {
            res.sendFile(sFileNachrichten);
            var sQuery = "SELECT * FROM userdata WHERE id = " + iUserid + ";";
            connection.query(sQuery, function (error, result, fields) {
                console.log("SYSTEM: Hallo User " + result[0].username + "! Du hast die UserID " + iUserid + "!");
            });
        } else {
            func.route(res, "/home");
        }
    });
}

exports.newMessage = function (req, res) { //in Bearbeitung
    res.sendFile();
}

// functional sites
exports.index = function (req, res) {
    func.route(res, "/home")
}

exports.newUser = function (req, res) {
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
        func.route(res, "/login");
    }
}

exports.loginUser = function (req, res) {
    var user = req.body.inputUser;
    var iPassword = req.body.inputPW;
    var sQuery = "SELECT * FROM userdata WHERE username = \"" + user + "\";";

    connection.query(sQuery, function (error, results, fields){ //Passwortüberprüfung
        if (error) throw error;
        var sHash = results[0].user_password;
        if (!bcrypt.compareSync(iPassword, sHash)) {
            res.send("Benutzername oder Passwort falsch!");
        } else {
            func.login(new cookies (req, res), {
                "login": true,
                "userid": results[0].id,
            });
            func.route(res, "/messenger");
        }
    });
}

exports.logout = function (req, res) {
    var oCookie = cookies(req, res);
    func.logout(new cookies(req, res), {
        "sessionid": oCookie.get("MESSENGER")
    });
    func.route(res, "/../home");
}

