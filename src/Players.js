const GeneralFunctions = require("./General.js")

class Players{
    constructor(teams)
    {
        this.players = []
        this.unactivePlayers = []
        this.teams = teams
    }

    Add(name)
    {
        var sessionId = GeneralFunctions.RandomString(21);

        // Add player to the smaller team
        var team = this.GetSmallestTeam()

        // If he is the only player make him the master
        var isMaster = false;
        if (this.GetTeam(team).length == 0)
            isMaster = true;

        this.players.push({
            "name" : name,
            "team" : team,
            "sessionId" : sessionId,
            "isMaster" : isMaster,
        })

        return sessionId;
    }

    ShuffleTeams()
    {
        // Remove all masters and shuffle the order of the players
        this.players.forEach((elem) => elem.isMaster = false);
        GeneralFunctions.Shuffle(this.players)

        for (var i = 0; i < this.players.length; i++)
        {
            this.players[i].team = this.teams[i % this.teams.length]

            // First player in the team is the master
            this.players[i].isMaster = (i < this.teams.length);
        }
    }

    GetPlayer(sessionId)
    {
        return this.players.filter(player => player.sessionId == sessionId)[0]
    }

    GetSmallestTeam()
    {
        // Create teams from the players
        var teams = []
        this.teams.forEach((team) => {
            teams.push({"name": team, "size": this.GetTeam(team).length})
        })

        // Get the smallest team
        var smallest = {"name": "error", "size": 999999};
        teams.forEach((team) => {
            if (team.size < smallest.size)
            {
                smallest = team;
            }
        })

        return smallest.name;
    }

    GetTeam(color)
    {
        return this.players.filter(player => player.team == color)
    }

    Remove(sessionId)
    {
        // No need to remove active players
        if (!this.unactivePlayers.includes(sessionId))
        {
            return false;
        }

        this.players = this.players.filter(player => player.sessionId != sessionId)
    }

    DisablePlayer(sessionId)
    {
        if (!this.unactivePlayers.includes(sessionId))
           this.unactivePlayers.push(sessionId)
    }

    ActivatePlayer(sessionId)
    {
        // Make player active again
        this.unactivePlayers = this.unactivePlayers.filter(player => player != sessionId)

    }
}

// Export our class
module.exports = Players;