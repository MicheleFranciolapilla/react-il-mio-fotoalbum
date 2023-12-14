const   express = require("express");
const   router = express.Router();

const   controller = require("../controllers/categoriesController");

router.get("/", controller.index);
router.get("/all_data", controller.index_all);
router.get("/:arg", controller.show);
router.post("/", controller.store);

module.exports = router;