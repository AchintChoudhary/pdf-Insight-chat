const { validationResult } = require("express-validator");
const chatBotServices=require('../services/chatBot.service.js')
const chatBotModel=require('../models/chatBot.model.js')
const path=require('path')
const {deleteFile}=require('../utils/helper.js')


module.exports.addChatBot= async (req, res, next) => {
  const error = validationResult(req);
try{
     if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}

const {name,message,prompt_message}=req.body;

//create User method
  const chatBot = await chatBotServices.createChatBot({
    name,
    message,
    prompt_message,
   image: req.file ? 'images/' + req.file.filename : null

  });
return res.status(200).json({
    success:true,
    msg:"Register Successfully",
    chatBot
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}



}

module.exports.getChatBot=async(req,res,next)=>{
  const error = validationResult(req);
try{
    if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}
const chatBots=await chatBotModel.find({})
return res.status(200).json({
    success:true,
    msg:"Chat bots",
    data:chatBots
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}

}


module.exports.updateChatBot= async (req, res, next) => {
  const error = validationResult(req);
try{
     if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}

const {id,name,message,prompt_message}=req.body;

const data={
  name,message,prompt_message
}

if(req.file!==undefined){
  data.image = 'images/'+req.file.filename
const chatbot=await chatBotModel.findOne({_id:id});

if (chatbot && chatbot.image) {
   const oldFilePath = path.join(__dirname, '../public', chatbot.image);
   await deleteFile(oldFilePath);
}
}

const chatBot=await chatBotModel.findByIdAndUpdate({_id:id},
{
  $set:data
},{
new:true
})


return res.status(200).json({
    success:true,
    msg:"chatbot update successfully",
    chatBot
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}



}

module.exports.deleteChatBot=async(req,res,next)=>{
   const error = validationResult(req);
try{
    if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}

const {id}=req.body;

  
const chatbot=await chatBotModel.findOne({_id:id});

if (chatbot && chatbot.image) {
   const oldFilePath = path.join(__dirname, '../public', chatbot.image);
   await deleteFile(oldFilePath);
}

const data=await chatBotModel.deleteOne({_id:id})


return res.status(200).json({
    success:true,
    msg:"Chat bot deleted successfully",
    data:data
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}

}















