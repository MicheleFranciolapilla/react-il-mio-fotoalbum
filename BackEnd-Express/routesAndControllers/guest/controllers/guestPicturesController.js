const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");

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

}

module.exports = { index, show } 