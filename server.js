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

app.get('/validate/:id', function(request, response) {
    if (ValidateSession(request.params.id))
    {
        response.redirect('/');
    }
    else
    {
        response.redirect('/register');
    }
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

var gameState = {
    "words" : GetWords(),
    "players" : {"red":[], "blue":[]},
    "turn" : 0,
    "side" : "red",
};

io.on('connection', function(socket) {
  socket.on('register', function(data) {
    AddPlayer(socket, data)
  });

  socket.on('chose word', SelectWord);
  socket.on('end turn', EndTurn);
  socket.on('reset game', ResetGame);
});

setInterval(function() {
  io.sockets.emit('state', gameState);
}, 1000 / 5);

function SelectWord(data)
{
    // TODO: add check that it is the correct user turn
    correctPlayer = false;
    for (var i = 0; i < gameState.players[gameState.side].length; i++)
    {
        if (gameState.players[gameState.side][i].session_id == data.player)
        {
            correctPlayer = true;
            break;
        }
    }

/*    if (!correctPlayer)
    {
        return;
    }*/

    // Change selected word to visible
    for (var i = 0; i < gameState.words.length; i++)
    {
        if (gameState.words[i].text == data.word)
        {
            gameState.words[i].state = "visible";
            gameState.turn += 1

            if (gameState.side == "red" && gameState.words[i].color != 3)
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

function AddPlayer(socket, name)
{
    var session_id = randomString(); //generating the sessions_id and then binding that socket to that sessions 
    gameState.players.red.push({"name": name, "ismaster" : false, "session_id": session_id})

    socket.room = session_id;
    socket.join(socket.room, function(res)
    {
        console.log("joined successfully")
        socket.emit("set-session-acknowledgement", { sessionId: session_id })
    });

}

function randomString(size = 21) {  
  return Crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0, size)
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
    currentPlayers = gameState.players
    gameState = {
        "words" : GetWords(),
        "players" : currentPlayers,
        "turn" : 0,
        "side" : "red"
    };
}

function EndTurn(data)
{
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