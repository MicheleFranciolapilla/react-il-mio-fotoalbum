const bcrypt = require("bcrypt");

async function hashPassword(password, cryptSalt)
{
    const hash = await bcrypt.hash(password, cryptSalt);
    return hash;
}

function removePassword(Obj)
{
    const toBeReturned = { ...Obj };
    if ((toBeReturned.user) && ((typeof toBeReturned.user) === "object") && (toBeReturned.user.password))
        delete toBeReturned.user.password;
    return toBeReturned;
}

module.exports = { hashPassword, removePassword };