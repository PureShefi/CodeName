// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const Crypto = require('crypto');
var WordFunctions = require('./words');


var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/register', function(request, response) {
  response.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/register/:name', function(request, response) {
    response.json(AddPlayer(request.params.name));
});

app.get('/validate/:id', function(request, response) {
    response.json(ValidateSession(request.params.id));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

var gameState = {
    "words" : GetWords(),
    "players" : {"red":[], "blue":[]},
    "turn" : 0,
    "side" : "red",
    "bombed" : false
};

io.on('connection', function(socket) {
    if (socket.handshake.query.session_id == undefined)
        return

    socket.session_id = socket.handshake.query.session_id
    socket.on('chose word', SelectWord);
    socket.on('end turn', EndTurn);
    socket.on('reset game', ResetGame);
    socket.on('disconnect', function(){
        RemovePlayer(socket.session_id);
    });
});

setInterval(function() {
  io.sockets.emit('state', gameState);
}, 1000 / 5);

function PlayerTeamTurn(session_id)
{
    // Don't allow to do anything in case of endgame
    if (gameSystem.bombed)
    {
        return false;
    }

    for (var i = 0; i < gameState.players[gameState.side].length; i++)
    {
        if (gameState.players[gameState.side][i].session_id == session_id)
        {
            return true;
        }
    }

    return false;
}

function SelectWord(data)
{
    if (!PlayerTeamTurn(data.player))
    {
        return;
    }

    // Change selected word to visible
    for (var i = 0; i < gameState.words.length; i++)
    {
        if (gameState.words[i].text == data.word)
        {
            gameState.words[i].state = "visible";
            gameState.turn += 1

            if (gameState.words[i].color == 1)
            {
                gameState.bombed = true;
                EndTurn();
            }
            else if (gameState.side == "red" && gameState.words[i].color != 3)
            {
                EndTurn();
            }
            else if (gameState.side == "blue" && gameState.words[i].color != 2)
            {
                EndTurn();
            }

            return;
        }
    }

    console.log("Error in selecting word");
}

function GetWords()
{
    // colors taken from https://materializecss.com/color.html
    words = WordFunctions.GetNewWords(25)
    // 0 - brown, 1 - black, 2 - blue, 3 - red
    colors = [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3]
    wordDict = []

    for (var i = 0; i < words.length; i++) {
        wordDict.push({"text": words[i], state: "hidden", color:colors[i]})
    }

    return WordFunctions.Shuffle(wordDict);
}

function AddPlayer(name)
{
    var session_id = randomString(); //generating the sessions_id and then binding that socket to that sessions 
    
    // Add player to the team with less people
    color = "red"
    if (gameState.players.red.length > gameState.players.blue.length)
        color = "blue"

    // If he is the first player in the team make him the master
    ismaster = false;
    if (gameState.players[color].length == 0)
        ismaster = true


    gameState.players[color].push({"name": name, "ismaster" : ismaster, "session_id": session_id})

    gameState.turn += 1
    return session_id;
}

function randomString(size = 21) {  
  return Crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0, size)
    .replace("/", "-")
}

function ValidateSession(id)
{
    // Check if user is the game
    for (var i = 0; i < gameState.players["red"].length; i++)
    {
        if (gameState.players["red"][i].session_id == id)
        {
            return true;
        }
    }
    for (var i = 0; i < gameState.players["blue"].length; i++)
    {
        if (gameState.players["blue"][i].session_id == id)
        {
            return true;
        }
    }

    return false;
}

function ResetGame(data)
{
    gameState.words = GetWords()
    gameState.turn = 0
    gameState.bombed = false
    gameState.side = "red"

    io.sockets.emit('new game', {turn: 0});
}

function EndTurn(data = undefined)
{
    if (data != undefined && !PlayerTeamTurn(data.player))
    {
        return;
    }

    gameState.turn += 1

    // Logic for turn sides
    if (gameState.side == "red")
    {
        gameState.side = "blue";
    }
    else
    {
        gameState.side = "red";
    }
}

function RemovePlayer(session_id)
{
    gameState.turn += 1
    // Check if user is the game
    for (var i = 0; i < gameState.players["red"].length; i++)
    {
        if (gameState.players["red"][i].session_id == session_id)
        {
            gameState.players["red"].splice(i, 1)
            return true;
        }
    }

    for (var i = 0; i < gameState.players["blue"].length; i++)
    {
        if (gameState.players["blue"][i].session_id == session_id)
        {
            gameState.players["blue"].splice(i, 1)
            return true;
        }
    }

    return false;
}