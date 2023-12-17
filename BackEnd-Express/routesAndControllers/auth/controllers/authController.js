const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();
const   jwt = require("jsonwebtoken");

const   ErrorEmailNotNew = require("../../../exceptionsAndMiddlewares/exceptions/exceptionsOnAuthentication/ErrorEmailNotNew");
const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");

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
}

module.exports = { signUp, logIn };