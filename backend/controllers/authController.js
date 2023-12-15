const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateSignupUser,
  validateLoginUser
} = require("../models/user");

module.exports.signIn = asyncHandler(async (req, res) => {
  const { error } = validateSignupUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json({ message: "Email used." });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();
  
  res.status(201).json({
    message: "Signin sucessfully, You can login now",
  });
});

module.exports.logIn = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).json({ message: error.message });

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "User not found." });

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch)
    return res.status(400).json({ message: "Password incorrect !" });

    const token = user.generateAuthToken();
     await user.save();

  res.status(201).json({
    username: user.username,
    _id: user._id,
    isAdmin: user.isAdmin,
    profileImage: user.profileImage,
    token,
  });
});

