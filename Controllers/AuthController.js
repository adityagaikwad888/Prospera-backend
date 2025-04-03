const User = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt, walletBalance } = req.body;
    if (!email || !password || !username || !walletBalance) {
      return res.json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({
      email,
      password,
      username,
      createdAt,
      walletBalance,
    });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production when using HTTPS
      maxAge: 60 * 60 * 1000, // 1 hour expiration
      sameSite: "None", // Make sure this is set to 'None' for cross-origin cookies
      withCredentials: true,
    });
    console.log("helo");
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password or email" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production when using HTTPS
      maxAge: 60 * 60 * 1000, // 1 hour expiration
      sameSite: "None", // Make sure this is set to 'None' for cross-origin cookies
      withCredentials: true,
    });
    res
      .status(201)
      .json({ message: "User logged in successfully", success: true, token });
    next();
  } catch (error) {
    console.error(error);
  }
};
