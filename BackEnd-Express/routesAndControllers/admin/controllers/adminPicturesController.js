const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   { splitMime, fileWithExt, deleteFile } = require("../../../utilities/filesUtilities");

const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");

const   imageFolderName = "imagesForPictures";

// Si recuperano tutte le categorie presenti al momento per essere certi che non ve ne siano di cancellate o modificate tra quelle con cui la picture deve restare connessa
async function getAllCategoriesIds()
{
    console.log("RICERCA DI TUTTE LE CATEGORIE PRESENTI NEL DB");
    let categoriesIds = [];
    try
    {
        const allCategories = await prisma.Category.findMany();
        if (allCategories.length !== 0)
            categoriesIds = allCategories.map( cat => cat.id );
    }
    catch(error)
    {
        categoriesIds = null;
    }
    console.log("RISULTATO DELLA RICERCA: ", categoriesIds);
    return categoriesIds;
}

async function index(req, res, next)
{

}

async function show(req, res, next)
{

}

async function store(req, res, next)
{
    // Validazioni su tipo ed esistenza dei dati da effettuare
    const { file } = req;
    fileWithExt(file);
    const { title, description, visible, userId, categories } = req.body;
    let allCategoriesIds = [];
    console.log("CATEGORIES RICEVUTE IN INPUT: ", categories);
    // Se sono state richiesti dei collegamenti con specifiche categorie, da parte del client, si verifica che esse siano effettivamente esistenti, in caso contrario le si rimuove, questo per garantire comunque il salvataggio dei dati senza incorrere in errori
    if (categories)
    {
        allCategoriesIds = await getAllCategoriesIds();
        if (allCategoriesIds === null)
        {
            console.log("ERRORE IN GETALLCATEGORIESIDS");
            deleteFile(file.filename, imageFolderName, splitMime(file.mimetype)[1]);
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
        }
        else if (allCategoriesIds.length !== 0)
        {
            console.log("FILTRIAMO LE CATEGORIE DI MODO CHE PASSINO SOLO QUELLE EFFETTIVAMENTE PRESENTI NEL DB");
            const newArray = categories.filter( cat => allCategoriesIds.includes(parseInt(cat)) );
            allCategoriesIds = newArray;
            console.log("CATEGORIE FILTRATE: ", allCategoriesIds);
        }
    }
    const prismaQuery = {   data    :   { 
                                            title       :   title, 
                                            description :   description,
                                            visible     :   ((visible.trim().toLowerCase() === "true") || (visible.trim() === "1")),
                                            image       :   file.filename,
                                            imageMime   :   file.mimetype,
                                            categories  :   {
                                                                connect :   allCategoriesIds.map( cat => ({ "id" : parseInt(cat) }) )
                                                            },
                                            userId      :   parseInt(userId)
                                        } 
                        };
    console.log("QUERY: ", prismaQuery);
    let newPicture = null;
    try
    {
        newPicture = await prisma.Picture.create(prismaQuery);
        if (newPicture)
        {
            console.log("Picture creata: ", newPicture);
            res.json({ new_picture : newPicture });
        }
        else
        {
            console.log("ERRORE NON DA CATCH");
            deleteFile(file.filename, imageFolderName, splitMime(file.mimetype)[1]);
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
        }
    }
    catch(error)
    {
        console.log("ERRORE DA CATCH");
        deleteFile(file.filename, imageFolderName, splitMime(file.mimetype)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function update(req, res, next)
{

}

async function destroy(req, res, next)
{

}

module.exports = { index, show, store, update, destroy }