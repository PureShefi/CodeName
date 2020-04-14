const Words = require("./Words.js")
const Players = require("./Players.js")

class Game{
    constructor()
    {
        this.words = new Words()
        this.players = new Players(["red", "blue"]);
        this.turn = 0
        this.side = 0
        this.bombed = false
    }

    PlayerTeamTurn(sessionId)
    {
        // If we are bombed it is no ones turn
        if (this.bombed)
            return false;

        var player = this.players.GetPlayer(sessionId);
        if (player == undefined)
            return false;

        return player.team == this.players.teams[this.side];
    }

    SelectWord(data)
    {
        // Make sure it is playing player turn
        if (!this.PlayerTeamTurn(data.player))
        {
            return;
        }

        // Change selected word to visible, return if is already selected
        if (!this.words.Select(data.word))
        {
            return;
        }

        // Get The word type
        var wordType = this.words.GetWordType(data.word)
        if (wordType == null)
        {
            console.log("Got illegal word");
            return;
        }

        // If clicked bomb or wrong color the teams turn is over
        if (wordType == "bomb")
        {
            this.bombed = true;
            this.EndTurn();
        }
        else if (wordType != this.players.teams[this.side])
        {
            this.EndTurn();
        }

        this.turn += 1
    }

    ValidateSession(sessionId)
    {
        // Check if the player exists
        this.players.ActivatePlayer(sessionId);
        return this.players.GetPlayer(sessionId) != undefined;
    }

    Reset()
    {
        this.words.Reset()
        this.players.ShuffleTeams();
        this.turn = 0
        this.side = 0
        this.bombed = false
    }

    EndTurn(data)
    {
        // Make sure it is playing player turn
        if (data != undefined && !this.PlayerTeamTurn(data.player))
        {
            return;
        }

        this.turn += 1
        this.side = (this.side + 1) % this.players.teams.length
    }

    GetState()
    {
        return {
            "words" : this.words.words,
            "players" : this.players.players,
            "turn" : this.turn,
            "side" : this.players.teams[this.side],
            "bombed" : this.bombed
        }
    }

    RemovePlayer(sessionId)
    {
        // on disconnect add to unactive players
        this.players.DisablePlayer(sessionId)

        // If he didn't come back after interval remove him
        setTimeout(() => {
            this.players.Remove(sessionId);
            this.turn += 1;
        }, 5000);
    }

    AddPlayer(name)
    {
        return this.players.Add(name);
    }
}

// Export our class
module.exports = Game;