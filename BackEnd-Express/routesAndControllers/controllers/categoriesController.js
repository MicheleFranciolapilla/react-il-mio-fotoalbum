const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   { pureSlug } = require("../../utilities/slugUtilities/slugFunctions");

const   ErrorFromDB = require("../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");
const   ErrorItemNotFound = require("../../exceptionsAndMiddlewares/exceptions/ErrorItemNotFound");

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
        next( new ErrorFromDB("Operazione non eseguibile al momento.") );
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
            next( new ErrorItemNotFound("Categoria non trovata") );
    }
    catch(error)
    {
        next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function store(req, res, next)
{
    const { name, thumb } = req.body;
    const slug = pureSlug(name);
    console.log("NAME: ", name, " SLUG: ", slug, " THUMB: ", thumb);
    // Al momento gestiamo solo il name. Del thumb ce ne occuperemo successivamente
    // Al momento lo slug lo generiamo quì, fermo restando che già in fase di validazione lo si sarà utilizzato. In seguito si potrebbe fare in modo che, già il validatore carichi il campo slug all'interno di req.body
    // Dovremo fare in modo che lo slug del name esculda i nomi non validi o ripetuti. Questo controllo lo effettueremo nelle validazioni
    let prismaQuery = { data : { "name" : name, "slug" : slug } };
    if (thumb)
        prismaQuery.data["thumb"] = thumb;
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
            next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
    catch(error)
    {
        next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

async function destroy(req, res, next)
{
    // Stessi discorsi fatti per la show
    // const argument = { "id" : parseInt(req.params.arg) };
    const argument = { "slug" : req.params.arg }
    const prismaQuery = { where : argument };
    let categoryToDelete = null;
    try
    {
        categoryToDelete = await prisma.Category.findUnique(prismaQuery);
            if (!categoryToDelete)
            {
                next( new ErrorItemNotFound("Categoria non trovata") );
                console.log("ERRORE LANCIATO");
            }
            else
            {
                /// Le seguenti due righe di codice servono per testare l'effettivo rilancio di un errore reale collegato alla crud delete
                // const fakeQuery = {...prismaQuery, campo_strano : true};
                // categoryToDelete = await prisma.Category.delete(fakeQuery);
                categoryToDelete = await prisma.Category.delete(prismaQuery);
                console.log("Categoria cancellata con successo: ", categoryToDelete);
                res.json({ category_deleted : categoryToDelete });
            }
    }
    catch(error)
    {
        console.log("VERO ERRORE")
        next( new ErrorFromDB("Operazione non eseguibile al momento.") );
    }
}

module.exports = { index, index_all, show, store, destroy }