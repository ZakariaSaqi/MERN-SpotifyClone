const router = require("express").Router()
const { getAllUsers, getUser, getUsersCount, updateUserProfile, profileImageUpload, deleteUserProfile } = require("../controllers/userController")
const photoUpload = require("../middlewares/photoUpload")
const validateID = require("../middlewares/validateID")
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyTokenAndAuthorization } = require("../middlewares/verifyToken")

router.route("/")
.get(verifyTokenAndAdmin, getAllUsers)

router.route("/user/:id")
.get(validateID, getUser)
.put(validateID, verifyTokenAndOnlyUser, updateUserProfile)
.delete(validateID, verifyTokenAndAuthorization, deleteUserProfile)

router.route("/count")
.get(verifyTokenAndAdmin ,getUsersCount)

router.route("/user/profile-image-upload")
.post(verifyToken, photoUpload.single("image"), profileImageUpload)



module.exports = router
