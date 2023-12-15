const router = require("express").Router()
const { signIn, logIn  } = require("../controllers/authController")
router.post("/signin", signIn)
router.post("/login", logIn)

module.exports = router
