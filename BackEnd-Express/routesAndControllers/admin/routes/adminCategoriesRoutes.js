const   express = require("express");
const   router = express.Router();

const   multer = require("multer");
const   thumbUploader = multer({ dest : "public/imagesForCategories" }).single("thumb");

const   controller = require("../controllers/adminCategoriesController");

router.get("/", controller.index);
router.get("/:arg", controller.show);
router.post("/", thumbUploader, controller.store);
router.put("/:arg", thumbUploader, controller.update);
router.delete("/:arg", controller.destroy);

module.exports = router;