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
    // Implementare un controllo che eviti di avere un currentPage nullo o superiore al numero di pagine possibili con l'attuale itemsPerPage
    // Implementare la logica delle query filters
    let itemsPerPage = 4;
    const currentPage = req.query.page || 1;
    let prismaQuery =   {   
                            skip    :   (currentPage - 1) * itemsPerPage, 
                            take    :   itemsPerPage,
                            include :   {
                                            user        :   true,
                                            categories  :   true 
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
    const prismaQuery = {   where   :   { 
                                            "id"        :   id 
                                        },
                            include :   {
                                            user        :   true,
                                            categories  :   true
                                        }
                        };
    let pictureToFind = null;
    try
    {
        pictureToFind = await prisma.Picture.findUnique(prismaQuery);
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

async function store(req, res, next)
{
    // Validazioni su tipo ed esistenza dei dati da effettuare
    const { file } = req;
    fileWithExt(file);
    let { title, description, visible, userId, categories } = req.body;
    if (!visible)
        visible = "";
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
                                        },
                            include :   {
                                            user        :   true,
                                            categories  :   true
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
    const id = parseInt(req.params.id);
    // Il principio da adottare in questa update è il seguente:
    // si da la possibilità di modificare solo alcuni elementi, lasciando invariata la foto (nel qual caso la si può non ricaricare)
    let prismaQuery = { where : { "id" : id } };
    let { title, description, visible, userId, categories } = req.body;
    if (!visible)
        visible = "";
    const { file } = req;
    let image = null;
    let imageMime = null;
    // Prevedere controlli sulla tipologia di file
    if (file)
    {
        console.log(file);
        image = file.filename;
        imageMime = file.mimetype;
        fileWithExt(file);
    }
    let pictureToUpdate = null;
    try
    {
        pictureToUpdate = await prisma.Picture.findUnique(prismaQuery);
        if (!pictureToUpdate)
        {
            console.log("ERRORE LANCIATO");
            if (image)
                deleteFile(image, imageFolderName, splitMime(imageMime)[1]);
            return next( new ErrorItemNotFound("Picture non trovata") );
        }
    }
    catch(error)
    {
        console.log("VERO ERRORE");
        if (image)
            deleteFile(image, imageFolderName, splitMime(imageMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    console.log("SI PROSEGUE, QUINDI LA PICTURE DA MODIFICARE ESISTE");

    let allCategoriesIds = [];
    console.log("CATEGORIES RICEVUTE IN INPUT: ", categories);
    // Se sono state richiesti dei collegamenti con specifiche categorie, da parte del client, si verifica che esse siano effettivamente esistenti, in caso contrario le si rimuove, questo per garantire comunque il salvataggio dei dati senza incorrere in errori
    if (categories)
    {
        allCategoriesIds = await getAllCategoriesIds();
        if (allCategoriesIds === null)
        {
            console.log("ERRORE IN GETALLCATEGORIESIDS");
            if (image)
                deleteFile(image, imageFolderName, splitMime(imageMime)[1]);
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

    const previousFile = { image : pictureToUpdate.image, imageMime : pictureToUpdate.imageMime};  

    prismaQuery["data"] =   { 
                                title       :   title, 
                                description :   description,
                                visible     :   ((visible.trim().toLowerCase() === "true") || (visible.trim() === "1")),
                                image       :   image ?? previousFile.image,
                                imageMime   :   imageMime ?? previousFile.imageMime,
                                categories  :   {
                                                    connect :   allCategoriesIds.map( cat => ({ "id" : parseInt(cat) }) )
                                                },
                                userId      :   parseInt(userId)
                            };
    console.log("QUERY: ", prismaQuery);

    try
    {
        pictureToUpdate = await prisma.Picture.update(prismaQuery);
    }
    catch(error)
    {
        // Se si verifica un errore in update dovrò cancellare il file che multer ha posizionato in cartella (laddove il client non abbia scelto di mantenere il precedente)
        if (image)
            deleteFile(image, imageFolderName, splitMime(imageMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento."));
    }
    // Se invece tutto è andato a buon fine, si procede alla cancellazione della vecchia immagine, laddove ve ne sia una nuova in sostituzione
    if (image)
        deleteFile(previousFile.image, imageFolderName, splitMime(previousFile.imageMime)[1]);
    console.log("Picture modificata in... ", pictureToUpdate);
    res.json({ picture_updated_to : pictureToUpdate });
}

async function destroy(req, res, next)
{
    const id = parseInt(req.params.id);
    const prismaQuery = { where : { "id" : id } };
    let pictureToDelete = null;
    try
    {
        pictureToDelete = await prisma.Picture.findUnique(prismaQuery);
            if (!pictureToDelete)
            {
                console.log("ERRORE LANCIATO");
                return next( new ErrorItemNotFound("Picture non trovata") );
            }
            pictureToDelete = await prisma.Picture.delete(prismaQuery);
            console.log("Picture cancellata con successo: ", pictureToDelete);
            if (pictureToDelete.image)
                deleteFile(pictureToDelete.image, imageFolderName, splitMime(pictureToDelete.imageMime)[1]);
            res.json({ picture_deleted : pictureToDelete });
    }
    catch(error)
    {
        console.log("VERO ERRORE")
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

module.exports = { index, show, store, update, destroy }