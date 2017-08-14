
function updateTransmitMessages () {
    $.getJSON("/updateTransmitMessages", function (aTransmit) {
        console.log(aTransmit[0]);
        console.log(aTransmit.length);
        
        var iMessage = aTransmit.length;
        while (iMessage > 0) {
            iMessage--;
            var to = aTransmit[iMessage].Sender;
            var date = aTransmit[iMessage].Datum;
            var note = aTransmit[iMessage].Nachricht;
            console.log(to);
            console.log(date);
            console.log(note);
            var message = "<tr><td>" + to + "</td><td>" + date + "</td><td>" + note + "</td></tr>";
            $(".transmit").find("tbody").append($(message));
        }
    });
};

function updateReceiveMessages () {
    $.getJSON("/updateReceiveMessages", function (aReceive) {
        console.log(aReceive[0]);
        console.log(aReceive.length);
        
        var iMessage = aReceive.length;
        while (iMessage > 0) {
            iMessage--;
            var by = aReceive[iMessage].Empfänger;
            var date = aReceive[iMessage].Datum;
            var note = aReceive[iMessage].Nachricht;
            console.log(by);
            console.log(date);
            console.log(note);
            var message = "<tr><td>" + by + "</td><td>" + date + "</td><td>" + note + "</td></tr>";
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

$(document).ready(function () {
    $(".update").on("click", function() {
        $("tbody").empty();
        updateTransmitMessages();
        updateReceiveMessages();
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
});

