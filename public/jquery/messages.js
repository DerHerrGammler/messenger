
function updateTransmitMessages () {
    $.getJSON("/updateTransmitMessages", function (aTransmit) {
        var iMessage = aTransmit.length;
        var n = -1;
        $(".transmit").find("h1").text(iMessage + " Gesendete Nachrichten");
        while (iMessage - 1 > n) {
            n++;
            var to = aTransmit[n].empfaenger;
            var date = aTransmit[n].datum;
            var note = aTransmit[n].nachricht;
        var message = "<tr><td>" + to + "</td><td class=\"date\">" + date + "</td><td class=\"trennung\">" + note + "</td></tr>";
            $(".transmit").find("tbody").append($(message));
        }
    });
};

function updateReceiveMessages () {
    $.getJSON("/updateReceiveMessages", function (aReceive) {
        var iMessage = aReceive.length;
        var n = -1;
        $(".receive").find("h1").text(iMessage + " Empfangene Nachrichten");
        while (iMessage - 1 > n) {
            n++;
            var by = aReceive[n].empfaenger;
            var date = aReceive[n].datum;
            var note = aReceive[n].nachricht;
            var message = "<tr><td>" + by + "</td><td class=\"date\">" + date + "</td><td class=\"trennung\">" + note + "</td></tr>";
            $(".receive").find("tbody").append($(message));
        }
    });
};

function takeTransmit () {
    if ($(".transmit").hasClass("opacity")) {
        $("#link-transmit").parents().toggleClass("active");
        $(".transmit").toggleClass("opacity");
    }
    if (!$(".receive").hasClass("opacity")) {
        $("#link-receive").parents().toggleClass("active");
        $(".receive").toggleClass("opacity");
    }
    if(!$(".newMessage").hasClass("opacity")) {
        $("#link-newMessage").parents().toggleClass("active");
        $(".newMessage").toggleClass("opacity");
    }
};

function takeReceive () {
    if (!$(".transmit").hasClass("opacity")) {
        $("#link-transmit").parents().toggleClass("active");
        $(".transmit").toggleClass("opacity");
    }
    if ($(".receive").hasClass("opacity")) {
        $("#link-receive").parents().toggleClass("active");
        $(".receive").toggleClass("opacity");
    }
    if(!$(".newMessage").hasClass("opacity")) {
        $("#link-newMessage").parents().toggleClass("active");
        $(".newMessage").toggleClass("opacity");
    }
};

function takeNewMessage () {
    if (!$(".transmit").hasClass("opacity")) {
        $("#link-transmit").parents().toggleClass("active");
        $(".transmit").toggleClass("opacity");
    }
    if (!$(".receive").hasClass("opacity")) {
        $("#link-receive").parents().toggleClass("active");
        $(".receive").toggleClass("opacity");
    }
    if($(".newMessage").hasClass("opacity")) {
        $("#link-newMessage").parents().toggleClass("active");
        $(".newMessage").toggleClass("opacity");
    }
};

function update () {
    $("tbody").empty();
    updateReceiveMessages();
    updateTransmitMessages();
};



$(document).ready(function () {
    update();
    $(".update").on("click", function() {
        update();
    });
    $("#link-transmit").on("click", function() {
        takeTransmit();
    });
    $("#link-receive").on("click", function() {
        takeReceive();
    });
    $("#link-newMessage").on("click", function() {
        takeNewMessage();
    });
    if ($(location).attr("pathname") === "/messenger/error404") {
        alert("User nicht gefunden. Bitte prüfen Sie den Usernamen.");
    }
    if ($(location).attr("pathname") === "/messenger/error122") {
        alert("Bitte schreiben Sie eine Nachricht. Leere Nachrichten können nicht übermittelt werden.");
    }
    if ($(location).attr("pathname") === "/messenger/error414") {
        alert("Ihre eingegebene Nachricht hat die Maximallänge von 999 Zeichen überschritten. Bitte fassen Sie sich kürzer.");
    }
    if ($(location).attr("pathname") === "/messenger/send") {
        alert("Ihr Nachricht wurde erfolgreich versand.")
    }
    $("#inputMessage").on("keyup", function () {
        var sMessage = $("#inputMessage").val()
        var iMessageLenght = sMessage.length;
        var iMaxLenght = $("#chars").data();
        var iChar = iMaxLenght.value - iMessageLenght;
        if (iChar < 0) {
            $("#chars").addClass("warning");
        } else {
            $("#chars").removeClass("warning");
        }
        $("#chars").text(iChar + " Zeichen Über");
    });
});

