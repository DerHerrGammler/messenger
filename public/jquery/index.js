$(document).ready(function () {
    $(".picture").on("dblclick", function() {
        $("img").toggleClass("just-hidden");
        $(".face").toggleClass("just-hidden");
    });
});