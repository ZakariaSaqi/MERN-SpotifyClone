const mongoose = require("mongoose");
const joi = require("joi");
require("dotenv").config();

const SongSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    track: {
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
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Song = mongoose.model("Song", SongSchema);

function validateAddSong(obj) {
  const schema = joi.object({
    name: joi.string().trim().required(),
    genre: joi.string().trim().required(),
    track: joi.string().trim().required(),
  });
  return schema.validate(obj);
}
function validateUpdateSong(obj) {
  const schema = joi.object({
    name: joi.string().trim(),
    genre: joi.string().trim(),
    track: joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  Song,
  validateAddSong,
  validateUpdateSong
  
};
