const   dotenv = require("dotenv").config();
const   express = require("express");

// Controllers
const   homeController = require("./routesAndControllers/controllers/homeController");

// Routers
const   routerForCategories = require("./routesAndControllers/routes/categoriesRoutes");

// Middlewares
const   error404 = require("./exceptionsAndMiddlewares/middlewares/error404RouteNotFound");
const   errorsManager = require("./exceptionsAndMiddlewares/middlewares/errorsManager");

const   port = process.env.PORT || 8080;
const   server = express();

        // Body parsers
        server.use(express.json());
        server.use(express.urlencoded({ extended : true }));

        // Definizione rotte
        // home
        server.get("/", homeController.home);
        server.get("/home", homeController.home);
        // categories
        server.use("/categories", routerForCategories);

        // Middlewares errori
        server.use(error404);
        server.use(errorsManager);

        server.listen(port, () => console.log(`Server in esecuzione su ${process.env.HOST}${port}`));