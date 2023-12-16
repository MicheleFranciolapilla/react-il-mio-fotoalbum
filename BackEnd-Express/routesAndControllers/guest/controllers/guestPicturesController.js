const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");

async function index(req, res, next)
{
    let prismaQuery = { "where" : { "visible" : true } };
    let totalPicturesAvailable = null;
    try
    {
        totalPicturesAvailable = await prisma.Picture.count(prismaQuery);
        console.log("VALORE: ", totalPicturesAvailable);
        if (totalPicturesAvailable < 1)
        {
            console.log("PICTURES TROVATE : nessuna");
            res.json({ "pictures" : [] });
            return;
        }
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    const itemsPerPage = 4;
    const total_pages = Math.ceil(totalPicturesAvailable / itemsPerPage);
    let currentPage = req.query.page || 1;
    if (currentPage > total_pages)
        currentPage = total_pages;
    if (currentPage < 1)
        currentPage = 1;
    prismaQuery =   {   "where"     :   prismaQuery["where"],
                        "skip"      :   (currentPage - 1) * itemsPerPage, 
                        "take"      :   itemsPerPage,
                        "include"   :   {
                                            "user"          :   true,
                                            "categories"    :   true 
                                        } 
                    };
    console.log("QUERY: ", prismaQuery);

    let pictures = [];
    try
    {
        pictures = await prisma.Picture.findMany(prismaQuery);
        console.log("PICTURES TROVATE ", pictures);
        res.json(   { 
                        "pictures"      :   pictures,
                        "paging_data"   :   {
                                                "total_pictures"    :   totalPicturesAvailable,
                                                "total_pages"       :   total_pages,
                                                "pictures_per_page" :   itemsPerPage,
                                                "current_page"      :   currentPage
                                            } 
                    });
        return;
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