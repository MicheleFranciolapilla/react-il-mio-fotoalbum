const   express = require("express");
const   router  = express.Router();

const   controllers = require("../controllers/authController");

router.post("/signup", controllers.signUp);
router.post("/login", controllers.logIn);

module.exports = router;