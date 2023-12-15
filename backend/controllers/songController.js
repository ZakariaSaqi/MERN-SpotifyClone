const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { validateAddSong, Song, validateUpdateSong } = require("../models/song");


module.exports.addSong = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No thumbnail provide" });

  const { error } = validateAddSong(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const song = new Song({
    name: req.body.name,
    genre: req.body.genre,
    track: req.body.track,
    artist: req.user.id,
    thumbnail: {
      url: result.secure_url,
      publicId: result.public_id,
    }
  });
  await song.save();

  res.status(200).json(song);
  fs.unlinkSync(imagePath);
});
module.exports.getAllSongs = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const songs = await Song.aggregate([
    {
      $lookup: {
        from: 'users', // Assuming your User collection is named 'users'
        localField: 'artist',
        foreignField: '_id',
        as: 'artistDetails',
      },
    },
    {
      $match: {
        $or: [
          { genre: { $regex: new RegExp(search, 'i') } },
          { name: { $regex: new RegExp(search, 'i') } },
          { 'artistDetails.username': { $regex: new RegExp(search, 'i') } },
        ],
      },
    },
    {
      $unset: 'artistDetails.password', // Exclude password from the result
    },
    {
      $project: {
        _id: 1,
        name: 1,
        genre: 1,
        track: 1,
        thumbnail: 1,
        artist: {
          $arrayElemAt: ['$artistDetails', 0],
        },
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res.status(200).json(songs);
});

module.exports.getSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id)

  if (!song) return res.status(404).json({ message: "Song not found" });

  res.status(200).json(song);
});

module.exports.getSongsCount = asyncHandler(async (req, res) => {
  const count = await Song.countDocuments();
  res.status(200).json(count);
});

module.exports.deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);

  if (!song) return res.status(404).json({ message: "Song not found" });

  if (req.user.isAdmin || req.user.id === song.artist.toString()) {
    await cloudinaryRemoveImage(song.thumbnail.publicId);
    
    await Song.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: `The song "${song.name}" has been deleted` });
  } else return res.status(403).json({ message: "Acces denied" });
});

module.exports.updateSong = asyncHandler(async (req, res) => {
  const { error } = validateUpdateSong(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ message: "Song not found" });

  if (req.user.id !== song.artist.toString())
    return res.status(403).json({ message: "Acces denied" });

  const updateSong= await Song.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        genre: req.body.genre,
        track: req.body.track,
      },
    },
    { new: true }
  )

  res.status(200).json(updateSong);
});

module.exports.updateSongThumbnail = asyncHandler(async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No thumbnail provide" });

  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ message: "Song not found" });

  if (req.user.id !== song.artist.toString())
    return res.status(403).json({ message: "Acces denied" });

  await cloudinaryRemoveImage(song.thumbnail.publicId);

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const updateSong = await Song.findByIdAndUpdate(
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

  res.status(200).json(updateSong);
  fs.unlinkSync(imagePath);
});

