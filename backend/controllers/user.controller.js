const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel=require('../models/blacklistToken.model')
const crypto = require("crypto");
const emailService = require("../services/email.service");

const genericResetMessage = "If an account exists for this email, a password reset link has been sent.";

module.exports.registerUser = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { fullname, email, password } = req.body;

const isUserAlreadyExist=await userModel.findOne({email})

if(isUserAlreadyExist){
    return res.status(400).json({message:'User already exist'})
}


  //hash method
  const hashPassword = await userModel.hashPassword(password);

  //create User method
  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
image: req.file ? 'upload/' + req.file.filename : null,
password: hashPassword,
  });

  //generate auth token method
  const token = user.generateAuthToken();
  res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  //compare method
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.image && !user.image.startsWith('http')) {
    user.image = `${process.env.BASE_URL || ''}${user.image}`;
  }

  const token = user.generateAuthToken();

  res.cookie('token',token)

  res.status(200).json({ token, user });
};

module.exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const email = req.body.email.trim().toLowerCase();
  const user = await userModel.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(200).json({ success: true, message: genericResetMessage });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
  const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;
  try {
    await emailService.sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save().catch(() => {});
    console.error("Password reset email delivery failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to send password reset email. Please try again later." });
  }

  return res.status(200).json({ success: true, message: genericResetMessage });
};

module.exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const tokenHash = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await userModel.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired password reset link." });
  }

  user.password = await userModel.hashPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return res.status(200).json({ success: true, message: "Password reset successfully." });
};



module.exports.getUserProfile=async(req,res,next)=>{
res.status(200).json(req.user)
}

module.exports.logoutUser=async(req,res,next)=>{
   // Client side se token cookie ko clear karna
  res.clearCookie('token');
  const token=req.cookies.token || req.headers.authorization?.split(' ')[1];

  // Current token ko cookies ya header se nikalna
  await blacklistTokenModel.create({token})
  res.status(200).json({message:'Logged out'})
}

// }