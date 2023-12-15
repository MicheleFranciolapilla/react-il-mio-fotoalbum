const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();
const   fileSystem = require("fs");
const   pathLibrary = require("path");

const   { pureSlug } = require("../../../utilities/slugUtilities/slugFunctions");

const   ErrorFromDB = require("../../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");
const   ErrorInvalidName = require("../../../exceptionsAndMiddlewares/exceptions/exceptionsOnCategories/ErrorInvalidName");

const   thumbFolderName = "imagesForCategories";

function splitMime(fileMime)
{  
    const result = fileMime.split("/");
    return result; 
}

function fileWithExt(fileObj)
{
    const extension = splitMime(fileObj.mimetype)[1];
    fileSystem.renameSync(fileObj.path, fileObj.path.concat(".", extension));
}

function deleteFile(fileName, fileExtension)
{
    const fileToDelete = pathLibrary.resolve(__dirname, "../../../public/", thumbFolderName, fileName.concat(".", fileExtension));
    fileSystem.unlinkSync(fileToDelete);
}

async function idBySlug(slugToCheck)
{
    let categoryWithSlug = null;
    console.log("FUNZIONE INVOCATA");
    try
    {
        console.log("TRY");
        categoryWithSlug = await prisma.Category.findUnique({ where : { slug : slugToCheck } });
        console.log("CATEGORYWITHSLUG: ", categoryWithSlug);
        if (categoryWithSlug)
            return categoryWithSlug.id;
        else
            return 0;
    }
    catch(error)
    {
        return -1;
    }
}

// Gestiamo la index di modo che possa restituire la lista delle categorie presenti e, opzionalmente, anche tutte le foto ad esse collegate (al momento, per la index completa di foto, utilizziamo la funzione index_all)
async function index(req, res, next)
{
    // Implementare un controllo che eviti di avere un currentPage nullo o superiore al numero di pagine possibili con l'attuale itemsPerPage
    let itemsPerPage = 5;
    const currentPage = req.query.page || 1;
    let prismaQuery = { skip : (currentPage - 1) * itemsPerPage, take : itemsPerPage };
    let categories = [];
    try
    {
        categories = await prisma.Category.findMany(prismaQuery);
        console.log("CATEGORIE TROVATE ", categories);
        res.json({ "categories" : categories });
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function index_all(req, res, next)
{

}

async function show(req, res, next)
{
    // Per ora diamo per scontato che l'argomento (slug o id che sia) abbia superato la validazione e che il validatore stesso abbia predisposta in req un campo { "slug" : slug } oppure { "id" : id }
    const argument = { "id" : parseInt(req.params.arg) };
    // const argument = { "slug" : req.params.arg }
    const prismaQuery = { where : argument };
    let categoryToFind = null;
    try
    {
        categoryToFind = await prisma.Category.findUnique(prismaQuery);
        if (categoryToFind)
        {
            console.log("Categoria cercata e trovata: ", categoryToFind);
            res.json({ category : categoryToFind });
        }
        else
            return next( new ErrorItemNotFound("Categoria non trovata") );
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function store(req, res, next)
{
    const { name } = req.body;
    const slug = pureSlug(name);
    const { file } = req;
    let thumb = null;
    let thumbMime = null;
    // Prevedere controlli sulla tipologia di file
    if (file)
    {
        console.log(file);
        thumb = file.filename;
        thumbMime = file.mimetype;
        fileWithExt(file);
    }
    const checkIdBySlug = await idBySlug(slug);
    if (checkIdBySlug === -1)
    {
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    else if (checkIdBySlug !== 0)
    {
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorInvalidName("Nome della categoria non valido.") );
    }
    console.log("NAME: ", name, " SLUG: ", slug, " THUMB: ", thumb, "MIME: ", thumbMime);
    // Al momento gestiamo solo il name. Del thumb ce ne occuperemo successivamente
    // Al momento lo slug lo generiamo quì, fermo restando che già in fase di validazione lo si sarà utilizzato. In seguito si potrebbe fare in modo che, già il validatore carichi il campo slug all'interno di req.body
    // Dovremo fare in modo che lo slug del name esculda i nomi non validi o ripetuti. Questo controllo lo effettueremo nelle validazioni
    let prismaQuery = { data : { "name" : name, "slug" : slug, "thumb" : thumb, "thumbMime" : thumbMime } };
    let newCategory = null;
    console.log("QUERY: ", prismaQuery);
    try
    {
        newCategory = await prisma.Category.create(prismaQuery);
        if (newCategory)
        {
            console.log("Categoria creata: ", newCategory);
            res.json({ new_category : newCategory });
        }
        // Quest'ultima condizione dovrebbe riguardare solo il caso di "ripetizione" di chiave unique; caso che sparirà con le validazioni pre chiamata
        else
        {
            if (thumb)
                deleteFile(thumb, splitMime(thumbMime)[1]);
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
        }
    }
    catch(error)
    {
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function update(req, res, next)
{
    // Considerazioni show + store
    // Il principio da adottare in questa update è il seguente:
    // Se ad essere aggiornato è solo il thumb o eventualmente il titolo, lasciando però lo slug invariato, si devono mantenere le relazioni precedenti, in caso contrario, le relazioni dovranno andare perse.
    // Ricordarsi di testare questo comportamento dopo aver implementato i controllers relativi alla tabella Pictures
    const argument = { "id" : parseInt(req.params.arg) };
    // const argument = { "slug" : req.params.arg }
    let prismaQuery = { where : argument };
    const { file } = req;
    let thumb = null;
    let thumbMime = null;
    // Prevedere controlli sulla tipologia di file
    if (file)
    {
        console.log(file);
        thumb = file.filename;
        thumbMime = file.mimetype;
        fileWithExt(file);
    }
    let categoryToUpdate = null;
    try
    {
        categoryToUpdate = await prisma.Category.findUnique(prismaQuery);
        if (!categoryToUpdate)
        {
            console.log("ERRORE LANCIATO");
            if (thumb)
                deleteFile(thumb, splitMime(thumbMime)[1]);
            return next( new ErrorItemNotFound("Categoria non trovata") );
        }
    }
    catch(error)
    {
        console.log("VERO ERRORE");
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    console.log("SI PROSEGUE");
    const { name } = req.body;
    const slug = pureSlug(name);
    const checkIdBySlug = await idBySlug(slug);
    if (checkIdBySlug == -1)
    {
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    else if ((checkIdBySlug !== 0) && (checkIdBySlug !== categoryToUpdate.id))
    {
        if (thumb)
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorInvalidName("Nome della categoria non valido.") );     
    }
    const previousFile = { thumb : categoryToUpdate.thumb, thumbMime : categoryToUpdate.thumbMime};  
    const { keepPreviousThumb } = req.body;
        
    if ((!thumb) && (keepPreviousThumb))
    {
        thumb = previousFile.thumb;
        thumbMime = previousFile.thumbMime;
    }

    console.log("PATH: ", pathLibrary.resolve(__dirname, "../../../public/", thumbFolderName, thumb.concat(".", splitMime(thumbMime)[1])));
    console.log("NAME: ", name, " SLUG: ", slug, " THUMB: ", thumb, "MIME: ", thumbMime);
    let dataQuery = { data : { "name" : name, "slug" : slug, "thumb" : thumb, "thumbMime" : thumbMime } }
    // Si manterranno le connessioni con le pictures solo se lo slug è rimasto invariato il che significa che si sta modificando la thumb o il nome in maniera non significativa (MA SOLO SE KEEP E' TRUE), altrimenti si perderanno le connessioni (SLUG DIFFERENTI O KEEP FALSE O ASSENTE)
    // Si commenta tutta la parte relativa all'eventuale mantenimento delle relazioni. Eventualmente lo si potrà implementare successivamente
    // const keepConnected = ((slug === categoryToUpdate.slug) && (keep));
    // connectionQuery = { pictures : { disconnect : true } };
    // if (keepConnected && categoryToUpdate.pictures)
    //     connectionQuery = { pictures : { connect : categoryToUpdate.pictures.map( picture => ({ "id" : picture.id }) ) } }
    // dataQuery.data["pictures"] = connectionQuery.pictures; 
    prismaQuery.where = { id : categoryToUpdate.id };
    const finalQuery = { where : prismaQuery.where, data : dataQuery.data };
    console.log("FINALQUERY: ", finalQuery);
    try
    {
    categoryToUpdate = await prisma.Category.update(finalQuery);
    }
    catch(error)
    {
        // Se si verifica un errore in update dovrò cancellare il file che multer ha posizionato in cartella
        // Se la variabile thumb non è nulla può voler dire due cose:
        // 1) volevo caricare un file immagine (che multer ha già posizionato) e che dovrò quindi rimuovere
        // 2) avevo chiesto di mantenere la vecchia immagine (in questo caso non dovrò cancellarla)
        if ((thumb) && (thumb !== previousFile.thumb))
            deleteFile(thumb, splitMime(thumbMime)[1]);
        return next( new ErrorFromDB("Operazione non eseguibile al momento."));
    }
    // Se invece tutto è andato a buon fine, si procede alla cancellazione della vecchia thumb, se esistente
    if (previousFile.thumb)
        deleteFile(previousFile.thumb, splitMime(previousFile.thumbMime)[1]);
    console.log("Categoria modificata in... ", categoryToUpdate);
    res.json({ category_updated_to : categoryToUpdate });
}

async function destroy(req, res, next)
{
    // Stessi discorsi fatti per la show
    const argument = { "id" : parseInt(req.params.arg) };
    // const argument = { "slug" : req.params.arg }
    const prismaQuery = { where : argument };
    let categoryToDelete = null;
    try
    {
        categoryToDelete = await prisma.Category.findUnique(prismaQuery);
            if (!categoryToDelete)
            {
                console.log("ERRORE LANCIATO");
                return next( new ErrorItemNotFound("Categoria non trovata") );
            }
            /// Le seguenti due righe di codice servono per testare l'effettivo rilancio di un errore reale collegato alla crud delete
            // const fakeQuery = {...prismaQuery, campo_strano : true};
            // categoryToDelete = await prisma.Category.delete(fakeQuery);
            categoryToDelete = await prisma.Category.delete(prismaQuery);
            console.log("Categoria cancellata con successo: ", categoryToDelete);
            if (categoryToDelete.thumb)
                deleteFile(categoryToDelete.thumb, splitMime(categoryToDelete.thumbMime)[1]);
            res.json({ category_deleted : categoryToDelete });
    }
    catch(error)
    {
        console.log("VERO ERRORE")
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

module.exports = { index, index_all, show, store, update, destroy }