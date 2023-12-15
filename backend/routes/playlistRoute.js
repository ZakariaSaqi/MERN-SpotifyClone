const router = require("express").Router()
const { createPlaylist, getAllPlaylsit, getPlaylistCount, getPlaylist, updatePlaylist, deletePlaylist, updatePlaylistThumbnail, AddToPlaylist, RemoveFromPlaylist } = require("../controllers/playlistController")
const photoUpload = require("../middlewares/photoUpload")
const validateID = require("../middlewares/validateID")
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken")

router.route("/")
.post(verifyToken, photoUpload.single("image"), createPlaylist)
.get(getAllPlaylsit)

router.route("/count").get(verifyTokenAndAdmin ,getPlaylistCount)

router.route("/:id")
.get(validateID, getPlaylist)
.put(verifyToken, validateID, updatePlaylist)
.delete(verifyToken, validateID, deletePlaylist)

router.route("/playlist-thumbnail-update/:id")
.put(validateID, verifyTokenAndAdmin,  photoUpload.single("image"), updatePlaylistThumbnail)

router.route("/add-to-playlist/:id")
.put(validateID, verifyToken, AddToPlaylist)

router.route("/remove-from-playlist/:id")
.put(validateID, verifyToken, RemoveFromPlaylist)

module.exports = router
