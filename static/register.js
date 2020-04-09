function JoinGame()
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/register/" + document.getElementById("name").value, false);
    xmlHttp.send( null );
    if (xmlHttp.responseText == "0")
    {
        alert("Failed registering, please try againg later");
        return false;
    }

    // Remove the " at the beggining and end
    cleanSession = xmlHttp.response.substring(1, xmlHttp.response.length-1)
    sessionStorage.setItem('sessionId', cleanSession);
    window.location = "/";
}