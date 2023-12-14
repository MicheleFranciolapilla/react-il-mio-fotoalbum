const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   { pureSlug } = require("../../utilities/slugUtilities/slugFunctions");

const   ErrorFromDB = require("../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");
const   ErrorInvalidName = require("../../exceptionsAndMiddlewares/exceptions/exceptionsOnCategories/ErrorInvalidName");

async function idBySlug(slugToCheck)
{
    let categoryWithSlug = null;
    try
    {
        categoryWithSlug = await prisma.Category.findUnique({ where : { slug : slugToCheck } });
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
    // const argument = { "id" : parseInt(req.params.arg) };
    const argument = { "slug" : req.params.arg }
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
    const { name, thumb } = req.body;
    const slug = pureSlug(name);
    const checkIdBySlug = await idBySlug(slug);
    if (checkIdBySlug === -1)
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    else if (checkIdBySlug !== 0)
        return next( new ErrorInvalidName("Nome della categoria non valido.") );
    console.log("NAME: ", name, " SLUG: ", slug, " THUMB: ", thumb);
    // Al momento gestiamo solo il name. Del thumb ce ne occuperemo successivamente
    // Al momento lo slug lo generiamo quì, fermo restando che già in fase di validazione lo si sarà utilizzato. In seguito si potrebbe fare in modo che, già il validatore carichi il campo slug all'interno di req.body
    // Dovremo fare in modo che lo slug del name esculda i nomi non validi o ripetuti. Questo controllo lo effettueremo nelle validazioni
    let prismaQuery = { data : { "name" : name, "slug" : slug } };
    prismaQuery.data["thumb"] = thumb ?? null;
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
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    catch(error)
    {
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function update(req, res, next)
{
    // Considerazioni show + store
    // Il principio da adottare in questa update è il seguente:
    // Se ad essere aggiornato è solo il thumb o eventualmente il titolo, lasciando però lo slug invariato, si devono mantenere le relazioni precedenti, in caso contrario, le relazioni dovranno andare perse.
    // Ricordarsi di testare questo comportamento dopo aver implementato i controllers relativi alla tabella Pictures
    // const argument = { "id" : parseInt(req.params.arg) };
    const argument = { "slug" : req.params.arg }
    let prismaQuery = { where : argument };
    let categoryToUpdate = null;
    try
    {
        categoryToUpdate = await prisma.Category.findUnique(prismaQuery);
        if (!categoryToUpdate)
        {
            console.log("ERRORE LANCIATO");
            return next( new ErrorItemNotFound("Categoria non trovata") );
        }
    }
    catch(error)
    {
        console.log("VERO ERRORE")
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    // Il codice prosegue anche dopo che si generano gli errori con il next, ragion per cui, nel proseguire si sottosta alla condizione di categoryToUpdate !== null
    if (categoryToUpdate)
    {
        console.log("SI PROSEGUE");
        const { name, thumb, keep } = req.body;
        const slug = pureSlug(name);
        const checkIdBySlug = await idBySlug(slug);
        if (checkIdBySlug == -1)
            return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
        else if ((checkIdBySlug !== 0) && (checkIdBySlug !== categoryToUpdate.id))
            return next( new ErrorInvalidName("Nome della categoria non valido.") );        
        let dataQuery = { data : { "name" : name, "slug" : slug } }
        dataQuery.data["thumb"] = thumb ??  null;
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
            return next( new ErrorFromDB("Operazione non eseguibile al momento."));
        }
        console.log("Categoria modificata in... ", categoryToUpdate);
        res.json({ category_updated_to : categoryToUpdate });
    }
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
            res.json({ category_deleted : categoryToDelete });
    }
    catch(error)
    {
        console.log("VERO ERRORE")
        return next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

module.exports = { index, index_all, show, store, update, destroy }