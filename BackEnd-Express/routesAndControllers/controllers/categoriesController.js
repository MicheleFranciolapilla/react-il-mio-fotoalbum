async function index(req, res, next)
{
    next(new Error("ERRORE VOLONTARIO"));
}

module.exports = { index }