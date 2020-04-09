module.exports = {
    GetNewWords: function(count)
    {
        words = Shuffle(wordList);
        return words.slice(0, count);
    },

    Shuffle: Shuffle
};

function Shuffle(a)
{
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
wordList = ["milk","greeting card","perfume","phone","checkbook","chair","piano","drawer","flag","car","tire swing","money","picture frame","blanket","tree","fork","rubber band","puddle","rusty nail","socks","grid paper","lace","seat belt","button","controller","lotion","fake flowers","monitor","chapter book","house","shoe lace","sofa","twezzers","toe ring","carrots","sidewalk","boom box","shirt","mp3 player","bowl"]