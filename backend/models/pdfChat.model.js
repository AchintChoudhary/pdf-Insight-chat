const mongoose = require("mongoose");


const chatSchema = new mongoose.Schema({
 user_id:{
type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'User'
 },
  
 conversation_id:{
    type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'PdfConversation'
},

user_message:{
    type:String,
    default:''
},

ai_message:{
    type:String,
    default:''
}

},{timestamps:{createdAt:true, updatedAt:true }});



const PdfChatModel=mongoose.model('PdfChat',chatSchema);

module.exports=PdfChatModel;
