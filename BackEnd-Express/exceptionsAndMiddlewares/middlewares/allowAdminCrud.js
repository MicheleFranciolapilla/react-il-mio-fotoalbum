const   jwt = require("jsonwebtoken");

const   ErrorInvalidToken = require("../exceptions/exceptionsOnAuthentication/ErrorInvalidToken");

function allowAdminCrud(req, res, next)
{
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) 
    {
        console.log("Utente non autorizzato");
        return next( new ErrorInvalidToken("Utente non autorizzato") );
    }
    const token = bearerToken.split(" ")[1];
    let userToAllow = null;
    try
    {
        userToAllow = jwt.verify(token, process.env.JWT_SECRET);
        if (!userToAllow)
            {
                console.log("TOKEN NON VALIDO (DA TRY)");
                return next( new ErrorInvalidToken("Utente non autorizzato") );
            }
    }
    catch(error)
    {
        console.log("TOKEN NON VALIDO (DA CATCH)");
        return next( new ErrorInvalidToken("Utente non autorizzato") );
    }
    req["user"] = userToAllow;
    console.log("USER: ", userToAllow);
    next();
} 

module.exports = { allowAdminCrud };