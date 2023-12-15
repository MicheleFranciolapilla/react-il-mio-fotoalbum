const   dotenv = require("dotenv").config();
const   express = require("express");

// Controllers
const   homeController = require("./routesAndControllers/guest/controllers/guestHomeController");

// Routers per rotte pubbliche
const   routerForPicturesGuest = require("./routesAndControllers/guest/routes/guestPicturesRoutes");

// Routers per rotte private (admin)
const   routerForCategories = require("./routesAndControllers/admin/routes/adminCategoriesRoutes");
const   routerForPicturesAdmin = require("./routesAndControllers/admin/routes/adminPicturesRoutes");

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
        // Rotte pubbliche
        // home
        server.get("/", homeController.home);
        server.get("/home", homeController.home);
        server.use("/pictures", routerForPicturesGuest);

        // Rotte private (admin)
        // categories
        server.use("/admin/categories", routerForCategories);
        server.use("/admin/pictures", routerForPicturesAdmin);

        // Middlewares errori
        server.use(error404);
        server.use(errorsManager);

        server.listen(port, () => console.log(`Server in esecuzione su ${process.env.HOST}${port}`));