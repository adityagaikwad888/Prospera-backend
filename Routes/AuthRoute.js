const { Signup,Signin} = require("../Controllers/AuthController");
const {userVerification} = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post(`/signup`, Signup);
router.post(`/signin`, Signin);
router.post(`/`, userVerification);

module.exports = router;