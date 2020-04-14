function JoinGame()
{
    var name = document.getElementById("name").value.replace("/", "-")
    var room = document.getElementById("room").value.replace("/", "-")
    var params = room + "/" + name

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/register/" + params, false);
    xmlHttp.send( null );
    if (xmlHttp.responseText == "0")
    {
        alert("Failed registering, please try againg later");
        return false;
    }

    // Remove the " at the beggining and end
    cleanSession = xmlHttp.response.substring(1, xmlHttp.response.length-1)
    sessionStorage.setItem('sessionId', cleanSession);
    sessionStorage.setItem('room', room);
    window.location = "/";
}

document.getElementById("room").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    JoinGame();
  }
});

document.getElementById("name").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    JoinGame();
  }
});
