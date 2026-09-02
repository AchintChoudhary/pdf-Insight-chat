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

pdf_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'PdfFile'
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

chatSchema.index({ conversation_id: 1, createdAt: 1 });



const PdfChatModel=mongoose.model('PdfChat',chatSchema);

module.exports=PdfChatModel;
