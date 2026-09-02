const mongoose = require("mongoose");
const Groq = require("groq-sdk");
const { validationResult } = require("express-validator");
const chatModel=require('../models/chat.Model.js')
const {
  isBotExists,
  isConversationExists,
  createConversation,
  updateConversation,
  createChat,
  updateChat,
  getLastConversations,
  chatWithOpenAi,
  isConversationExistWithUser
} = require("../utils/helper.js");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//{---->There are many tasks being performed within the conversation process, such as if the conversation already exists(old conversation with Bot)then a new conversation will not be created.

// And the last message of the conversation will also be updated if the user chats back in the old conversation.<-----}

//{---->Simply if the conversation is updated then update it, if it is not updated then create a new one.<----}

//last message in converstion is AI_reply

module.exports.sendMessage = async (req, res) => {
  const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { chat_bot_id, message, conversation_id } = req.body;

    //check bot is exists
    const chatBotData = await isBotExists(chat_bot_id);
    if (!chatBotData) {
      return res.status(200).json({
        success: false,
        msg: "chat_bot_id does not exists",
      });
    }

    //conversation
    const user_id = req.user._id;
    let c_conversation_id = null;
   const isValidConversationId =
  conversation_id && mongoose.Types.ObjectId.isValid(conversation_id);



if (isValidConversationId) {
  const isExists = await isConversationExists(conversation_id);
  if (!isExists) {
    return res.status(200).json({
      success: false,
      msg: "conversation_id doesn't exist",
    });
  }

  c_conversation_id = conversation_id;
  await updateConversation(c_conversation_id, message);
} else {
  c_conversation_id = await createConversation(
    user_id,
    chat_bot_id,
    message
  );
}
//create chat
     const chat_id=await createChat(user_id,c_conversation_id,chat_bot_id,message)

//AI work START 

const system_prompt=chatBotData?chatBotData.prompt_message:"You are a helpful assistant."
const role_key="role"
const content_key="content"
const user_key="user"
const system_key="system"
const assistant_key="assistant"

const history=[{[role_key]:system_key,[content_key]:system_prompt}]

const conversation=await getLastConversations(user_id,c_conversation_id,chat_bot_id);

for(const chat of conversation){
  history.push({[role_key]:user_key,[content_key]:chat.user_message});
  if(chat.ai_message){
    history.push({[role_key]:assistant_key,[content_key]:chat.ai_message});
  }
}

const ai_reply=await chatWithOpenAi(history,user_id)
//AI work END


const updatedChat=await updateChat(chat_id,ai_reply);

await updateConversation(c_conversation_id,ai_reply)


    

    return res.status(200).json({
      success: true,
      msg: "send message successfully",
      conversation_id:c_conversation_id,
      data: updatedChat, //completion.choices[0].message.content
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};


module.exports.getMessages=async(req,res)=>{
const error = validationResult(req);
  try {
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
   const {conversation_id}=req.query
    
   const user_id=req.user._id

   const isExists=await isConversationExistWithUser(conversation_id,user_id)

if(!isExists){
return res.status(200).json({
  success:false,
  msg:"conversation doesn't exists!"
})
}


 const chats = await chatModel.find({
  conversation_id,
  user_id: user_id
})
.populate('user_id','name email')
.populate('chat_bot_id','name image')
.sort({ createdAt: 1 })




    return res.status(200).json({
      success: true,
      msg: "Messages get successfully",

      data: chats, 
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);

    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
}





