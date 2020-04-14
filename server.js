// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const Game = require('./src/Game.js');

SERVER_PORT = 8080

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var games = {};

app.set('port', SERVER_PORT);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/register', function(request, response) {
  response.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/register/:room/:name', function(request, response) {
    // Create the room if it doesn't exist
    if (games[request.params.room] == undefined)
        games[request.params.room] = new Game(request.params.room);

    response.json(games[request.params.room].AddPlayer(request.params.name));
});

app.get('/validate/:room/:id', function(request, response) {
    // Make sure game really exists
    if (games[request.params.room] == undefined)
    {
        response.json(false)
        return;
    }

    response.json(games[request.params.room].ValidateSession(request.params.id));
});

server.listen(SERVER_PORT, function() {
  console.log('Starting server on port '+ SERVER_PORT);
});

io.on('connection', function(socket) {
    if (socket.handshake.query.sessionId == undefined || socket.handshake.query.room == undefined)
        return

    var room = socket.handshake.query.room
    socket.join(room)

    socket.sessionId = socket.handshake.query.sessionId

    socket.on('chose word', (data) => {
        if (games[room] == undefined) return;

        games[room].SelectWord(data);
        UpdateState(room);
    });

    socket.on('end turn', (data) => {
        if (games[room] == undefined) return;

        games[room].EndTurn(data);
        UpdateState(room);
    });

    socket.on('reset game', (data) => {
        if (games[room] == undefined) return;

        games[room].Reset(data);
        io.sockets.in(room).emit("new game");
        UpdateState(room);
    });

    socket.on('disconnect', () => {
        if (games[room] == undefined) return;

        games[room].RemovePlayer(socket.sessionId, DeleteRoom)
        UpdateState(room);
    });

    UpdateState(room);
});

function UpdateState(room)
{
    if (games[room] == undefined) return;

    io.sockets.in(room).emit('state', games[room].GetState());
}

function DeleteRoom(room)
{
    delete games[room];
}