const   express = require("express");
const   router  = express.Router();

const   controllers = require("../controllers/authController");

router.post("/signup", controllers.signUp);
router.post("/login", controllers.logIn);
router.post("/verifytoken", controllers.verifyToken);

module.exports = router;