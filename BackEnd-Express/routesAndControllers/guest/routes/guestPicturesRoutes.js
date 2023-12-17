const express = require("express");
const router = express.Router();

const controllers = require("../controllers/guestPicturesController");

router.get("/", controllers.index);
router.get("/:id", controllers.show);

module.exports = router; 