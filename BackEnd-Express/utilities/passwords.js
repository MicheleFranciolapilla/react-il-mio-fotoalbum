const bcrypt = require("bcrypt");

async function hashPassword(password, cryptSalt)
{
    const hash = await bcrypt.hash(password, cryptSalt);
    return hash;
}

module.exports = hashPassword;