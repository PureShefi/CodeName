// Validate currect login
session_id = null;
GetSessionId();

var socket = io('', {'sync disconnect on unload': true,  query: "session_id=" + session_id});

// Make sure that we are connected
cardColors = ["brown lighten-3","blue-grey darken-4", "blue", "red"]
const COLORS = {
    BROWN : 0,
    BLACK : 1,
    BLUE : 2,
    RED : 3
}

var gameMaster = false;

prevState = -1
socket.on('state', function(gameState) {
    // Skip if no changes needed
    if (prevState == gameState.turn)
    {
        return;
    }

    ShowPlayers(gameState.players);
    ShowWords(gameState.words);
    ShowCurrentTurnBanner(gameState);
    ChangeScore(gameState.words);
    prevState = gameState.turn
    document.getElementById("body").style.display = "";
});

function GetCardStringFromWord(word, newRow)
{
    // Remove color if the word is hidden
    let textColor = "white-text";
    let wordColor = cardColors[word.color]
    if (word.state == "hidden" && gameMaster == false)
    {
        wordColor = "grey lighten-2";
        textColor = "";
    }

    cardStr = ' \
    <div class="col fifth-size"> \
        <div class="card clickable waves-effect display-block waves-light ' + wordColor +'"> \
            <div class="card-content ' + textColor + '" onclick="ChooseWord(\'' + word.text + '\')"> \
                <span class="card-title center-align">' + word.text + '</span> \
            </div> \
        </div> \
    </div>'

    return cardStr;
}

function ShowWords(words)
{
    table = document.getElementById("word-list");
    list = "";
    
    for (i = 0; i < words.length; i++)
    {
        list += GetCardStringFromWord(words[i], i % 5 == 0);
    }
    table.innerHTML = list;
}

function ShowListOfPlayers(teams, color)
{
    teamStr = '<li class="collection-header"><h4>' + color.toUpperCase() + ' TEAM</h4></li>'
    teams[color].forEach(function(player){
        if (player.ismaster)
        {
            if (player.session_id == session_id)
                gameMaster = true

            teamStr += '<li class="collection-item active ' + color + '">' + player.name + '</li>'
        }
        else
        {
            boxColor = ""
            if (player.session_id == session_id)
                boxColor = "lime lighten-3 black-text"

            teamStr += '<li class="collection-item ' + boxColor + '">' + player.name + '</li>'
        }
    })

    teamList = document.getElementById(color +"-team");
    teamList.innerHTML = teamStr;
}
function ShowPlayers(players)
{
    ShowListOfPlayers(players, "red");
    ShowListOfPlayers(players, "blue");
}

function ChooseWord(word)
{
    socket.emit('chose word', {"word": word, "player": session_id})
}

function ShowCurrentTurnBanner(gameState)
{
    if (gameState.side == "red")
    {
        document.getElementById("blue-banner").style.display = "none";
        document.getElementById("red-banner").style.display = "";
    }
    else
    {
        document.getElementById("red-banner").style.display = "none";
        document.getElementById("blue-banner").style.display = "";
    }
}

function ChangeBackgroundColor(color)
{
    document.getElementById("body").className = color;
}

function ResetGame()
{
    ChangeBackgroundColor("grey lighten-3")
    prevState = -1
    socket.emit('reset game', {endgame: true})
}

function EndTurn()
{
    // TODO: Add option to validate currect user ends the turn
    socket.emit('end turn', null)
}

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
});


function ChangeScore(words)
{
    blueCardsLeft = 0;
    redCardsLeft = 0;

    for (i = 0; i < words.length; i++)
    {
        if (words[i].state != "hidden")
            continue;

        if (words[i].color == COLORS.BLUE)
            blueCardsLeft += 1;

        if (words[i].color ==  COLORS.RED)
            redCardsLeft += 1;
    }

    document.getElementById("blue-score").innerHTML = blueCardsLeft;
    document.getElementById("red-score").innerHTML = redCardsLeft;

    if (blueCardsLeft == 0)
        ChangeBackgroundColor("blue lighten-4")

    if (redCardsLeft == 0)
        ChangeBackgroundColor("red lighten-4")
}

function GetSessionId()
{
    session_id = sessionStorage.getItem('sessionId');
    if (session_id == null)
    {
        window.location = "/register";
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/validate/" + session_id, false );
    xmlHttp.send( null );
    if (xmlHttp.responseText != "true")
    {
        window.location = "/register";
    }
    console.log(xmlHttp.responseText);
}