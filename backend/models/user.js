const mongoose = require("mongoose");
const joi = require("joi");
// const passworComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    isArtist: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
UserSchema.virtual("songs", {
  ref : "Song",
  foreignField : "artist",
  localField : "_id"
})
UserSchema.virtual("playlists", {
  ref : "Playlist",
  foreignField : "owner",
  localField : "_id"
})
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.SECRET);
};

const User = mongoose.model("User", UserSchema);

function validateSignupUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().required(),
    email: joi.string().trim().email().required(),
    password: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

function validateEamil(obj) {
  const schema = joi.object({
    email: joi.string().trim().email().required(),
  });
  return schema.validate(obj);
}

function validateNewPassword(obj) {
  const schema = joi.object({
    password: joi.string().trim().required(),
  });
  return schema.validate(obj);
}
function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim(),
    password: joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateSignupUser,
  validateLoginUser,
  validateNewPassword,
  validateEamil,
  validateUpdateUser,
};
