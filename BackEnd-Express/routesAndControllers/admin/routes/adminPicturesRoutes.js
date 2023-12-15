const express = require("express");
const router = express.Router();

const   multer = require("multer");
const   imageUploader = multer({ dest : "public/imagesForPictures" }).single("image");

const   controller = require("../controllers/adminPicturesController");

router.get("/", controller.index);
router.get("/:id", controller.show);
router.post("/", controller.store);
router.put("/:id", controller.update);
router.delete("/:id", controller.destroy);

module.exports = router;