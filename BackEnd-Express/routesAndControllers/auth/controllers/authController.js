const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();
const   jwt = require("jsonwebtoken");
const   bcrypt = require("bcrypt");

const   ErrorEmailNotNew = require("../../../exceptionsAndMiddlewares/exceptions/exceptionsOnAuthentication/ErrorEmailNotNew");
const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");
const   ErrorWrongPassword = require("../../../exceptionsAndMiddlewares/exceptions/exceptionsOnAuthentication/ErrorWrongPassword");
const   ErrorInvalidToken = require("../../../exceptionsAndMiddlewares/exceptions/exceptionsOnAuthentication/ErrorInvalidToken");

const   { hashPassword } = require("../../../utilities/passwords");

const   jwtExpiresIn = "1h";

async function signUp(req, res, next)
{
    // Aggiungere validazioni
    const { name, surname, email, password } = req.body;
    // Si verifica che la mail non sia già registrata nel db
    try
    {
        const checkUser = await prisma.User.findUnique({ "where" : { "email" : email } }); 
        if (checkUser)
        {
            console.log("EMAIL GIA' REGISTRATA!");
            return next( new ErrorEmailNotNew("Errore: email già registrata!") );
        }
    }
    catch(error)
    {
        console.log("ERRORE IN REGISTRAZIONE");
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    // Nessun errore, email nuova .... si procede
    const hashedPsw = await hashPassword(password, 10);
    let newUser = null;
    try
    {
        newUser = await prisma.User.create( {   "data"  :   {
                                                                "name"      :   name,
                                                                "surname"   :   surname,
                                                                "email"     :   email,
                                                                "password"  :   hashedPsw
                                                            } 
                                            }); 
        if (!newUser)
        {
            console.log("ERRORE IN REGISTRAZIONE");
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
        }
    }
    catch(error)
    {
        console.log("ERRORE IN REGISTRAZIONE");
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    // Nessun errore..... si procede
    delete newUser.password;
    const token = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn });
    console.log("TOKEN: ", token);
    res.json({newUser, token});
}

async function logIn(req, res, next)
{
    // Aggiungere validazioni
    const { email, password } = req.body;
    let userToLog =  null;
    try
    {
        userToLog = await prisma.User.findUnique({ "where" : { "email" : email } });
        if (!userToLog)
        {
            console.log("EMAIL NON TROVATA");
            return next( new ErrorItemNotFound("Utente non trovato") );
        }
    }
    catch(error)
    {
        console.log("ERRORE IN LOGIN");
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    const checkPsw = await bcrypt.compare(password, userToLog.password);
    if (!checkPsw)
    {
        console.log("PASSWORD ERRATA");
        return next( new ErrorWrongPassword("Password errata") );
    }
    delete userToLog.password;
    const token = jwt.sign(userToLog, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn });
    console.log("TOKEN: ", token);
    res.json({userToLog, token});
}

async function verifyToken(req, res, next)
{
    const { token } = req.body; 
    let verified = null;
    try
    {
        verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified)
        {
            console.log("TOKEN NON VALIDO (DA TRY)");
            return next( new ErrorInvalidToken("Token non valido o scaduto.") );
        }
    }
    catch(error)
    {
        console.log("TOKEN NON VALIDO (DA CATCH)");
        return next( new ErrorInvalidToken("Token non valido o scaduto.") );
    }
    console.log("Token valido", verified);
    res.json({verified});
}

module.exports = { signUp, logIn, verifyToken };