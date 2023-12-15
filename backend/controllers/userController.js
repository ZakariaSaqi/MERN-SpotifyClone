const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/user");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { cloudinaryRemoveImage, cloudinaryUploadImage, cloudinaryRemoveAllImage } = require("../utils/cloudinary");
const { Playlist } = require("../models/playlist");
const { Song } = require("../models/song");

module.exports.getAllUsers = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Acces deined" });
    const {  search } = req.query;
    let query = {};
    if (search) {
      // Use a regular expression to perform a case-insensitive search on title or description
      query = {
        $or: [
          { username: { $regex: new RegExp(search, 'i') } },
        ],
      };
    }
    let users
    if(search) {
      users = await User.find(query)
    } else {
      users = await User.find()
    }
   

  res.status(200).json(users);
});

module.exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  .populate({
    path: "songs",
    model: "Song", 
  }).populate({
    path: "playlists",
    model: "Playlist", 
  });;
  
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
});

module.exports.getUsersCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.status(200).json(count);
});

module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) return res.status(400).json({ message: error.message });

  if (req.body.password) {
    const salt = await bcrypt.genSalt();
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
      },
    },
    { new: true }
  )

  res.status(200).json(updateUser);
});

module.exports.profileImageUpload = asyncHandler(async (req, res) => {

  if (!req.file) res.status(400).json({ message: "No image provide" });

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const user = await User.findById(req.user.id)
  if(user.profileImage.publicId) await cloudinaryRemoveImage(user.profileImage.publicId)

  user.profileImage = {
    url: result.secure_url,
    publicID: result.public_id,
  }
  await user.save()

  res.status(200).json({
    message: "Your profile image uploaded successfully",
    profileImage: {
      url: result.secure_url,
      publicID: result.public_id,
    },
  })

  fs.unlinkSync(imagePath);

});

module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" });

    if(user.profileImage.publicId !== null) await cloudinaryRemoveImage(user.profileImage.publicId)

    await Playlist.deleteMany({owner : user._id})
    await Song.deleteMany({artist : user._id})
    
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ message : "Account has been deleted"})

})
