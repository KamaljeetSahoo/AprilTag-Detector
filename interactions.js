$(document).ready(function () {
    $("#input_switch").click(function () {
        if ($("#input_switch").text() == 'Show input feed') {
            $("#input_switch").html('Hide input feed')
            $("#webcam_feed").toggle()
        }
        else {
            $("#input_switch").html('Show input feed')
            $("#webcam_feed").toggle()
        }
    })
})