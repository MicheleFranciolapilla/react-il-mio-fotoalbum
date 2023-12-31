require("dotenv").config();
const   cors = require("cors");
const   express = require("express");

// Controllers
const   homeController = require("./routesAndControllers/guest/controllers/guestHomeController");

// Routers per rotte pubbliche
const   routerForPicturesGuest = require("./routesAndControllers/guest/routes/guestPicturesRoutes");

// Routers per rotte private (admin)
const   routerForCategories = require("./routesAndControllers/admin/routes/adminCategoriesRoutes");
const   routerForPicturesAdmin = require("./routesAndControllers/admin/routes/adminPicturesRoutes");

// Routers per rotte miste (pubbliche / private)
const   routerForUsers = require("./routesAndControllers/users/routes/guestUsersRoutes");

// Routers per rotte di autenticazione
const   routerForAuthentication = require("./routesAndControllers/auth/routes/authRoutes");

// Middlewares
const   error404 = require("./exceptionsAndMiddlewares/middlewares/error404RouteNotFound");
const   errorsManager = require("./exceptionsAndMiddlewares/middlewares/errorsManager");
const   { allowAdminCrud } = require("./exceptionsAndMiddlewares/middlewares/allowAdminCrud");

// Configurazione server
const   port = process.env.PORT || 8080;
const   server = express();

        // Middleware relativo alle CORS Policy
        server.use(cors(
                {
                        origin          :       "*",
                        methods         :       "GET, POST, PUT, DELETE",
                        credentials     :       true 
                }));

        server.use(express.static("public"));

        // Body parsers
        server.use(express.json());
        server.use(express.urlencoded({ extended : true }));

        // Rotte pubbliche
        server.get("/", homeController.home);
        server.get("/home", homeController.home);
        server.use("/pictures", routerForPicturesGuest);

        // Rotte private (admin)
        // Rotte admin con middleware per verifica token
        server.use("/admin/categories", allowAdminCrud, routerForCategories);
        server.use("/admin/pictures", allowAdminCrud, routerForPicturesAdmin);

        //Rotte miste (pubbliche / private)
        server.use("/users", routerForUsers);

        // Rotte di autenticazione
        server.use("/auth", routerForAuthentication);

        // Middlewares errori
        server.use(error404);
        server.use(errorsManager);

        server.listen(port, () => console.log(`Server in esecuzione su ${process.env.HOST}${port}`));