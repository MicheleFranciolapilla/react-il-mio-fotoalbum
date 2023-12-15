const   dotenv = require("dotenv").config();
const   express = require("express");

// Controllers
const   homeController = require("./routesAndControllers/guest/controllers/homeController");

// Routers
const   routerForCategories = require("./routesAndControllers/admin/routes/categoriesRoutes");

// Middlewares
const   error404 = require("./exceptionsAndMiddlewares/middlewares/error404RouteNotFound");
const   errorsManager = require("./exceptionsAndMiddlewares/middlewares/errorsManager");

// Configurazione server
const   port = process.env.PORT || 8080;
const   server = express();

        server.use(express.static("public"));

        // Body parsers
        server.use(express.json());
        server.use(express.urlencoded({ extended : true }));

        // Definizione rotte
        // home
        server.get("/", homeController.home);
        server.get("/home", homeController.home);
        // categories
        server.use("/admin/categories", routerForCategories);

        // Middlewares errori
        server.use(error404);
        server.use(errorsManager);

        server.listen(port, () => console.log(`Server in esecuzione su ${process.env.HOST}${port}`));