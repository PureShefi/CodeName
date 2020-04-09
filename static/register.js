var socket = io();

socket.on("set-session-acknowledgement", function(data) {
    sessionStorage.setItem('sessionId', data.sessionId);
    window.location = "/";
})

function JoinGame()
{
    socket.emit('register', document.getElementById("name").value)
}