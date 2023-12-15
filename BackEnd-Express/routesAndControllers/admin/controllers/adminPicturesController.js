

async function index(req, res, next)
{

}

async function show(req, res, next)
{

}

async function store(req, res, next)
{
     const { file } = req;
     const { title, description, visible, userId, categories } = req.body;
     console.log(`title: ${title}, description: ${description}, visible: ${visible}, userId: ${userId}, categories: ${categories}, file: ${file}`);
    //  res.json({title: title, description: description, visible: visible, userId: userId, categories: categories, file: file});
}

async function update(req, res, next)
{

}

async function destroy(req, res, next)
{

}

module.exports = { index, show, store, update, destroy }