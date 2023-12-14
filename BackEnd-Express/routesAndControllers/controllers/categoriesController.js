const   { PrismaClient } = require("@prisma/client");
const   prisma = new PrismaClient();

const   { pureSlug } = require("../../utilities/slugUtilities/slugFunctions");

const   ErrorFromDB = require("../../exceptionsAndMiddlewares/exceptions/ErrorFromDB");

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
            next( new ErrorFromDB("Non è possibile creare la categoria richiesta.") );
    }
    catch(error)
    {
        next( new ErrorFromDB("Non è possibile creare la categoria richiesta.") );
    }
}

module.exports = { index, index_all, store }