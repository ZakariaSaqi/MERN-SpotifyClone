const mongoose = require("mongoose");
const joi = require("joi");
require("dotenv").config();

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

function validateCreatePlaylist(obj) {
  const schema = joi.object({
    name: joi.string().trim().required(),
  });
  return schema.validate(obj);
}
function validateUpdatePlaylist(obj) {
  const schema = joi.object({
    name: joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  Playlist,
  validateCreatePlaylist,
  validateUpdatePlaylist,
};
