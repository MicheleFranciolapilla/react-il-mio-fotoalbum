const   jwt = require("jsonwebtoken");

const   ErrorInvalidToken = require("../exceptions/exceptionsOnAuthentication/ErrorInvalidToken");

function checkTokenValidity(token)
{
    let verified = null;
    try
    {
        verified = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(error)
    {
        console.log("TOKEN NON VALIDO");
    }
    return verified;
}

function allowAdminCrud(req, res, next)
{
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) 
    {
        console.log("Utente non autorizzato");
        return next( new ErrorInvalidToken("Utente non autorizzato") );
    }
    const token = bearerToken.split(" ")[1];
    const userToAllow = checkTokenValidity(token);
    if (!userToAllow)
        return next( new ErrorInvalidToken("Utente non autorizzato") );
    
    req["user"] = userToAllow;
    console.log("THE USER: ", userToAllow);
    next();
} 

module.exports = { allowAdminCrud, checkTokenValidity };