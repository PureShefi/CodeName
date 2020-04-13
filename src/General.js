const Crypto = require('crypto');

module.exports = {
    Shuffle: Shuffle,
    RandomString: RandomString
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

function RandomString(size) {
  return Crypto
    .randomBytes(size)
    .toString('base64')
    .slice(0, size)
    .replace("/", "-")
}