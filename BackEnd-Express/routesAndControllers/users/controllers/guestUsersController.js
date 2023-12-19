const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");

async function index(req, res, next)
{
    let allUsers = null;
    try
    {
        allUsers = await prisma.User.findMany();
        console.log("USERS TROVATI: ", allUsers);
        res.json({ "users" : allUsers });
        return;
    }
    catch(error)
    {
        console.log("Errore generico");
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );    
    }

}

module.exports = { index }