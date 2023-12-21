const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   { removePassword } = require("../../../utilities/passwords");
const   { retrieveValidFilters, avoidDuplicates, buildWhereQuery } = require("../../../utilities/filterUtilities/filteringFunctions");

const   allowedFilters = require("../../../utilities/filterUtilities/allowedFilters/guestFilters.json");

const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");

let     itemsPerPage = 4;

async function index(req, res, next)
{
    const { filter } = req.query || null;
    console.log(filter);
    let prismaQuery = { "where" : { "visible" : true } };
    let validFilters = {};
    if (filter)
    {
        console.log("FILTRI ALL'ORIGINE: ", filter);
        validFilters = avoidDuplicates(retrieveValidFilters(filter, false), true, true);
        console.log("FILTRI VALIDI: ", validFilters);
        prismaQuery = buildWhereQuery(prismaQuery, validFilters, false);
        console.log("THE QUERY IS: ",prismaQuery);
    }
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
    // Si consente al front end di decidere il numero di elementi per pagina. Validare questo input di modo che sia di tipo valido e tale che (0 < numero <= 10)
    const { itemsxpage } = req.query || null;
    if (itemsxpage)
        itemsPerPage = parseInt(itemsxpage);
    const total_pages = Math.ceil(totalPicturesAvailable / itemsPerPage);
    let currentPage = req.query.page || 1;
    if (currentPage > total_pages)
        currentPage = total_pages;
    if (currentPage < 1)
        currentPage = 1;
    prismaQuery =   {   
                        "where"     :   prismaQuery["where"],
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
        const noPswPictures = pictures.map( item => 
            {
                noPswItem = removePassword(item);
                return noPswItem;
            });
        pictures = noPswPictures;
        res.json(   { 
                        "pictures"      :   pictures,
                        "valid_filters" :   (Object.keys(validFilters).length !== 0) ? validFilters : "none",
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
            pictureToFind = removePassword(pictureToFind);
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

function getAllowedFilters(req, res)
{
    res.json({ allowedFilters });
}

module.exports = { index, show, getAllowedFilters } 