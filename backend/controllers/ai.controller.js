const userModel = require("../models/user.model");

const { validationResult } = require("express-validator");
const chatBotModel=require('../models/chatBot.model')
const conversationsModel=require('../models/conversation.model')
module.exports.getChatBot=async(req,res,next)=>{
  const error = validationResult(req);
try{
    if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}

const {id}=req.query;

let data=null;
if(id){
data=await chatBotModel.findOne({_id:id})
}else{
data=await chatBotModel.find({},{_id:1,name:1}).lean()
}


return res.status(200).json({
    success:true,
    msg:"Chat bots",
    data:data
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}

}


module.exports.getConversations=async(req,res,next)=>{
  const error = validationResult(req);
try{
    if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
}

const {chat_bot_id}=req.query;
const user_id=req.user._id
const data=await conversationsModel.find({user_id,chat_bot_id}).sort({updatedAt:-1})

return res.status(200).json({
    success:true,
    msg:"Conversations",
    data:data
})

}catch(error){
return res.status(400).json({
    success:false,
    msg:error.message,
})
}

}