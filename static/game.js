var sessionId = null;
var gameMaster = false;
var prevState = -1;

// Validate currect login
GetSessionId();

var socket = io('', {'sync disconnect on unload': true,  query: "sessionId=" + sessionId});

// Make sure that we are connected
cardColors = ["brown lighten-3","grey darken-4", "blue", "red"]
const COLORS = {
    BROWN : 0,
    BLACK : 1,
    BLUE : 2,
    RED : 3
}

socket.on('state', function(gameState) {
    ShowPlayers(gameState.players);
    ShowWords(gameState.words);
    ShowCurrentTurnBanner(gameState);
    ChangeScore(gameState.words);

    // Instante win if bomb was clicked
    if (gameState.bombed == true)
    {
        ChangeBackgroundColor(gameState.side + " lighten-4")
    }

    document.getElementById("body").style.display = "";
});

socket.on('new game', function(){
    ChangeBackgroundColor("grey lighten-3")
    prevState = -1
})

function GetCardStringFromWord(word)
{
    // Remove color if the word is hidden
    let wordColor = cardColors[word.color]

    // If it is hidden don't show the color
    if (word.state == "hidden" && window.gameMaster == false)
    {
        wordColor = "grey lighten-2 black-text";
    }

    if (window.gameMaster)
    {
        // Allow game master to see diffs more easily
        if (word.state == "hidden")
            wordColor = wordColor + " lighten-2"
        else
            wordColor = "darken-1 " + wordColor
    }


    cardStr = '\
    <div class="col fifth-size white-text"> \
        <div class="card clickable waves-effect waves-light word-card ' + wordColor +'""> \
            <div class="card-content" onclick="ChooseWord(\'' + word.text + '\')"> \
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
        if ((i) % 5 == 0){
            list += "</div>"
            list += "<div class='row words-row' >"
        }
        list += GetCardStringFromWord(words[i]);
    }
    table.innerHTML = list;
}

function ShowListOfPlayers(players, color)
{
    teamStr = '<li class="collection-header"><h4>' + color.toUpperCase() + ' TEAM</h4></li>'
    players.forEach(function(player){
        gameMasterBorder = ""
        starIcon = ""

        // We get one team at a time
        if (player.team != color)
        {
            return;
        }

        // Add color if it is the game master
        if (player.isMaster)
        {
            gameMasterBorder = color + " active"
        }

        // Add star if it is the current user
        if (player.sessionId == sessionId)
        {
            starIcon = ' <i class="material-icons" style="font-size: inherit">star</i> '
            window.gameMaster = player.isMaster
            console.log(window.gameMaster)
        }

        teamStr += '<li class="collection-item ' + gameMasterBorder + '">' + starIcon + player.name + '</li>'
    })

    teamList = document.getElementById(color +"-team");
    teamList.innerHTML = teamStr;

    return teamStr;
}
function ShowPlayers(players)
{
    sideNavMenu = ShowListOfPlayers(players, "red");
    sideNavMenu += ShowListOfPlayers(players, "blue");
    document.getElementById("slide-out").innerHTML = sideNavMenu;
}

function ChooseWord(word)
{
    // Don't allow game masters to choose words
    if (window.gameMaster)
        return;

    socket.emit('chose word', {"word": word, "player": sessionId})
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
    socket.emit('reset game', {endgame: true})
}

function EndTurn()
{
    socket.emit('end turn', {"player": sessionId})
}

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
        ChangeBackgroundColor("blue lighten-3")

    if (redCardsLeft == 0)
        ChangeBackgroundColor("red lighten-3")
}

function GetSessionId()
{
    sessionId = sessionStorage.getItem('sessionId');
    if (sessionId == null)
    {
        window.location = "/register";
        return;
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/validate/" + sessionId, false );
    xmlHttp.send( null );
    if (xmlHttp.responseText != "true")
    {
        window.location = "/register";
        return;
    }
}

document.addEventListener('DOMContentLoaded', function() {
  var navs = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(navs, {"draggable": true});

  var modals = document.querySelectorAll('.modal');
  var instances = M.Modal.init(modals);
});
