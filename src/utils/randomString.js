const crypto = require("node:crypto");

function randomString(size = 32, encoding = "hex") {
    const buffer = crypto.randomBytes(size);
    const keyHex = buffer.toString(encoding);
    return keyHex;
}

module.exports = randomString;
