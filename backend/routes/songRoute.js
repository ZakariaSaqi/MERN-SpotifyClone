const router = require("express").Router()
const { addSong, getAllSongs, getSong, getSongsCount, deleteSong, updateSong, updateSongThumbnail } = require("../controllers/songController")
const photoUpload = require("../middlewares/photoUpload")
const validateID = require("../middlewares/validateID")
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken")

router.route("/")
.post(verifyToken, photoUpload.single("image"),addSong)
.get(getAllSongs)

router.route("/count").get(verifyTokenAndAdmin ,getSongsCount)

router.route("/:id")
.get(validateID, getSong)
.put(verifyToken, validateID, updateSong)
.delete(verifyToken, validateID, deleteSong)

router.route("/song-thumbnail-update/:id")
.put(validateID, verifyTokenAndAdmin,  photoUpload.single("image"), updateSongThumbnail)




module.exports = router
