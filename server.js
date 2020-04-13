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

var gameState = new Game();
app.set('port', SERVER_PORT);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/register', function(request, response) {
  response.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/register/:name', function(request, response) {
    response.json(gameState.AddPlayer(request.params.name));
});

app.get('/validate/:id', function(request, response) {
    response.json(gameState.ValidateSession(request.params.id));
});

server.listen(SERVER_PORT, function() {
  console.log('Starting server on port '+ SERVER_PORT);
});

io.on('connection', function(socket) {
    if (socket.handshake.query.sessionId == undefined)
        return

    socket.sessionId = socket.handshake.query.sessionId
    socket.on('chose word', (data) => {
      gameState.SelectWord(data);
    });
    socket.on('end turn', (data) => {
      gameState.EndTurn(data);
    });
    socket.on('reset game', (data) => {
      gameState.Reset(data);
      io.sockets.emit("new game")
    });

    socket.on('disconnect', () => {
        gameState.RemovePlayer(socket.sessionId)
    });
});

setInterval(function() {
  io.sockets.emit('state', gameState.GetState());
}, 1000 / 5);

