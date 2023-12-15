const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const {
  validateCreatePlaylist,
  Playlist,
  validateUpdatePlaylist,
} = require("../models/playlist");

module.exports.createPlaylist = asyncHandler(async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No thumbnail provide" });

  const { error } = validateCreatePlaylist(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const playlist = new Playlist({
    name: req.body.name,
    owner: req.user.id,
    thumbnail: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  await playlist.save();

  res.status(200).json(playlist);
  fs.unlinkSync(imagePath);
});
module.exports.getAllPlaylsit = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = {};

  query = {
    $or: [{ name: { $regex: new RegExp(search, "i") } }],
  };

  const playlist = await Playlist.find(query)
  .limit(3)
  .sort({ createdAt: -1 });

  res.status(200).json(playlist);
});

module.exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
  .populate({
    path: "songs",
    model: "Song", 
  });

  if (!playlist) return res.status(404).json({ message: "playlist not found" });

  res.status(200).json(playlist);
});

module.exports.getPlaylistCount = asyncHandler(async (req, res) => {
  const count = await Playlist.countDocuments();
  res.status(200).json(count);
});

module.exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);

  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  if (req.user.isAdmin || req.user.id === playlist.owner.toString()) {
    await cloudinaryRemoveImage(playlist.thumbnail.publicId);

    await Playlist.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: `The playlist "${playlist.name}" has been deleted` });
  } else return res.status(403).json({ message: "Acces denied" });
});

module.exports.updatePlaylist = asyncHandler(async (req, res) => {
  const { error } = validateUpdatePlaylist(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  if (req.user.id !== playlist.owner.toString())
    return res.status(403).json({ message: "Acces denied" });

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
      },
    },
    { new: true }
  );

  res.status(200).json(updatePlaylist);
});

module.exports.updatePlaylistThumbnail = asyncHandler(async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No thumbnail provide" });

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  if (req.user.id !== playlist.owner.toString())
    return res.status(403).json({ message: "Acces denied" });

  await cloudinaryRemoveImage(playlist.thumbnail.publicId);

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        thumbnail: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  res.status(200).json(updatePlaylist);
  fs.unlinkSync(imagePath);
});

module.exports.AddToPlaylist = asyncHandler(async (req, res) => {
  let playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  if (req.user.id !== playlist.owner.toString())
    return res.status(403).json({ message: "Acces denied" });

  playlist = await Playlist.findByIdAndUpdate(
    req.params.id,
    { $push: { songs: req.body.songId } },
    { new: true }
  );
  res.status(200).json(playlist);
});



module.exports.RemoveFromPlaylist = asyncHandler(async (req, res) => {
  let playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });

  if (req.user.id !== playlist.owner.toString())
    return res.status(403).json({ message: "Acces denied" });

  playlist = await Playlist.findByIdAndUpdate(
    req.params.id,
    { $pull: { songs: req.body.songId } },
    { new: true }
  );
  res.status(200).json(playlist);
});

