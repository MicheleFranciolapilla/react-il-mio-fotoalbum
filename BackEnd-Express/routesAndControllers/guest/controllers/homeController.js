function home(req, res)
{
    res.json({ "API" : "FotoAlbum" });
}

module.exports = { home }