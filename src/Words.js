const GeneralFunctions = require("./General.js")
const fs = require('fs');
const path = require('path');

class Words{
    constructor(size)
    {
        this.size = size;
        this.words = this.GetWords();
        this.wordTypes = ["brown", "bomb", "blue", "red"]
    }

    GetWords()
    {
        // Get 25 random words from the list
        var words = WordList.GetWords();
        GeneralFunctions.Shuffle(words);
        words = words.slice(0, 25);

        // 0 - brown, 1 - black, 2 - blue, 3 - red
        var colors = [0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3];
        var wordDict = [];

        for (var i = 0; i < words.length; i++) {
            wordDict.push({"text": words[i], state: "hidden", color:colors[i]})
        }

        return GeneralFunctions.Shuffle(wordDict);
    }

    GetWordType(text)
    {
        var word = this.words.filter(word => word.text == text)[0];
        if (word == undefined)
        {
            return null;
        }

        return this.wordTypes[word.color];
    }

    Select(text)
    {
        // Find word and make it visible
        for (var i = 0; i < this.words.length; i++)
        {
            if (this.words[i].text == text)
                this.words[i].state = "visible";
        }
    }

    Reset()
    {
        this.words = this.GetWords();
    }
}

// Static class to read words from file only once
class WordList{
    static GetWords()
    {
        if (!WordList.words)
        {
            WordList.words = fs.readFileSync(path.join(__dirname, "word_list.txt")).toString().split("\r\n");
        }

        return WordList.words;
    }
}

// Export our class
module.exports = Words;