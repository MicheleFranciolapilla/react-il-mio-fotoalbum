const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");

async function index(req, res, next)
{
    let itemsPerPage = 4;
    const currentPage = req.query.page || 1;
    let prismaQuery =   {   "where"     :   {   "visible"       :   true },
                            "skip"      :   (currentPage - 1) * itemsPerPage, 
                            "take"      :   itemsPerPage,
                            "include"   :   {
                                                "user"          :   true,
                                                "categories"    :   true 
                                            } 
                        };
    let pictures = [];
    try
    {
        pictures = await prisma.Picture.findMany(prismaQuery);
        console.log("PICTURES TROVATE ", pictures);
        res.json({ "pictures" : pictures });
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function show(req, res, next)
{
    const id = parseInt(req.params.id);
    console.log("ID RICHIESTO: ",id);
    const prismaQuery = {   "where"     :   { 
                                                "id"            :   id,
                                                "visible"       :   true 
                                            },
                            "include"   :   {
                                                "user"          :   true,
                                                "categories"    :   true
                                            }
                        };
    let pictureToFind = null;
    try
    {
        pictureToFind = await prisma.Picture.findFirst(prismaQuery);
        if (pictureToFind)
        {
            console.log("Picture cercata e trovata: ", pictureToFind);
            res.json({ picture : pictureToFind });
        }
        else
            return next( new ErrorItemNotFound("Picture non trovata") );
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

module.exports = { index, show } 