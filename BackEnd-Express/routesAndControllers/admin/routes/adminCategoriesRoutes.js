const   express = require("express");
const   router = express.Router();

const   multer = require("multer");
const   thumbUploader = multer({ dest : "public/imagesForCategories" }).single("thumb");

const   controllers = require("../controllers/adminCategoriesController");

router.get("/", controllers.index);
router.get("/:arg", controllers.show);
router.post("/", thumbUploader, controllers.store);
router.put("/:arg", thumbUploader, controllers.update);
router.delete("/:arg", controllers.destroy);

module.exports = router;