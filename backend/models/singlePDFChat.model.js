const mongoose=require('mongoose')

const singlePdfChatSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
     pdf_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'SinglePdf'
    },
   user_message:{
type:String,
default:""
   },
    ai_message:{
        type:String,
        default:''
    }
},{
    timestamps:{createdAt:true,updatedAt:true}
})


const singlePdfChatModel =mongoose.model('SinglePdfChat',singlePdfChatSchema)

module.exports=singlePdfChatModel







