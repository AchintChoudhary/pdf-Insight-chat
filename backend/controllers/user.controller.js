const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const chatBotModel=require('../models/chatBot.model')
const blacklistTokenModel=require('../models/blacklistToken.model')

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
user.image=user.image.startsWith('http')?user.image :`${process.env.BASE_URL}${user.image}`
  if (!user) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  //compare method
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();

  res.cookie('token',token)

  res.status(200).json({ token, user });
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

// module.exports.getChatBot=async(req,res,next)=>{
//   const error = validationResult(req);
// try{
//     if (!error.isEmpty()) {
//     return res.status(400).json({ error: error.array() });
// }

// const {id}=req.query;

// let data=null;
// if(id){
// data=await chatBotModel.findOne({_id:id})
// }else{
// data=await chatBotModel.find({},{_id:1,name:1}).lean()
// }


// return res.status(200).json({
//     success:true,
//     msg:"Chat bots",
//     data:data
// })

// }catch(error){
// return res.status(400).json({
//     success:false,
//     msg:error.message,
// })
// }

// }