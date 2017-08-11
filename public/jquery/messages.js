
function getMessage (iArray) {
    console.log(iArray)
}

$(document).ready(function () {
    var iNachG = 4
    var iNachE = 7
    
    var von = "DieFrauGammler";
    var an = "DieFrauGammler";
    var note1 = "Das essen war lecker, aber ich denke das nächste mal sollte ich wieder kochen. Etwas anbrennen lassen hast du es ja doch irgendwie!!";
    var note2 = "JAJA!!! Du kannst mich mal!! Wenn dir mein essen nicht gefällt, dann sich dir doch nen anderen der für dich kocht.";
    
    $(".update").on("click", function() {
        var iNG = 0;
        var iNE = 0;
        $(".transmit").find("h1").text("Gesendete Nachrichten: " + iNachG);
        while (iNG < iNachG) {
            getMessage(iNG);
            iNG++
            $(".transmit").find("tbody").append($("<tr><td>" + an + "</td><td>" + note1 +"</td></tr>"));
        }
        $(".receiv").find("h1").text("Empfangene Nachrichten: " + iNachE);
        while (iNE < iNachE) {
            iNE++
            $(".receiv").find("tbody").append($("<tr><td>" + von + "</td><td>" + note2 + "</td></tr>"));
        }
    });
});

/*
über eine funktion die nachrichten daten aus der datenbank bekommen und dann hinzufügen lassen

funktion zur überprüfung wie viele nachrichten es gibt

Nachrichten als tabelle anzeigen!!!! und tabellen items hinzufügen statt normalen <p>
anzeige wie viele neue nachrichten bzw nachrichten
ganze  mit if-clause lösen
-> solange nachrichtenmegne < 10 weiter nachrichten laden
-> solange aus dem result der datenbank kein error kommt nen array weiter erhöhen und so alle nachrichten laden
*/