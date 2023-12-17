const express = require("express");
const router = express.Router();

const   multer = require("multer");
const   imageUploader = multer({ dest : "public/imagesForPictures" }).single("image");

const   controllers = require("../controllers/adminPicturesController");

router.get("/", controllers.index);
router.get("/:id", controllers.show);
router.post("/", imageUploader, controllers.store);
router.put("/:id", imageUploader, controllers.update);
router.delete("/:id", controllers.destroy);

module.exports = router;