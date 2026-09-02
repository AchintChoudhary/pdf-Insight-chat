const Groq = require("groq-sdk");
const fs = require("fs").promises; 
const { pipeline } = require("@xenova/transformers");



const chatBotModel = require("../models/chatBot.model");
const chatModel = require("../models/chat.Model");
const conversationModel = require("../models/conversation.model");
const embeddingModel = require("../models/fileEmbedding.model");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}




module.exports.deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("File deleted Successfully");
  } catch (error) {}
};

module.exports.isBotExists = async (id) => {
  try {
    const isExists = await chatBotModel.findOne({ _id: id });
    if (!isExists) {
      return false;
    }
    return isExists;
  } catch (error) {
    return null;
  }
};

module.exports.isConversationExists = async (id) => {
  try {
    const isExists = await conversationModel.findOne({ _id: id });
    if (!isExists) {
      return false;
    }
    return true;
  } catch (error) {
    return null;
  }
};

module.exports.isConversationExistWithUser = async (id, user_id) => {
  try {
    const isExists = await conversationModel.findOne({ _id: id, user_id });
    if (!isExists) {
      return false;
    }
    return true;
  } catch (error) {
    return null;
  }
};

module.exports.createConversation = async (user_id, chat_bot_id, message) => {
  try {
    const conversation = await conversationModel.create({
      user_id,
      chat_bot_id,
      last_message: message,
    });

    return conversation._id;
  } catch (error) {
    return null;
  }
};

module.exports.updateConversation = async (conversation_id, message) => {
  try {
    const updateConversation = await conversationModel.findByIdAndUpdate(
      conversation_id,
      { $set: { last_message: message } },
      { new: true },
    );

    return updateConversation;
  } catch (error) {
    return null;
  }
};

module.exports.createChat = async (
  user_id,
  conversation_id,
  chat_bot_id,
  message,
) => {
  try {
    const conversation = await chatModel.create({
      user_id,
      conversation_id,
      chat_bot_id,
      user_message: message,
    });

    return conversation._id;
  } catch (error) {
    return null;
  }
};

module.exports.updateChat = async (id, ai_message) => {
  try {
    const updatedChat = await chatModel.findByIdAndUpdate(
      id,
      { $set: { ai_message: ai_message } },
      { new: true },
    );

    return updatedChat;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

module.exports.getLastConversations = async (
  user_id,
  conversation_id,
  chat_bot_id,
) => {
  try {
    const chats =await chatModel
      .find({
        user_id,
        conversation_id,
        chat_bot_id,
      })
      .limit(8)
      .lean();

    return chats;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

module.exports.chatWithOpenAi = async (history, user_id) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ Updated model
      messages: history,
      //     [
      //     { role: "system", content: "You are a helpful AI assistant." },
      //     { role: "user", content: message }
      //   ],
      temperature: 0.7,
      max_tokens: 500,
      user: user_id,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

module.exports.chatWithPdf = async (context, question) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ Updated model
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that answers based on uploaded PDFs",
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log(error.message);
    throw new error();
  }
};


module.exports.splitIntoChunks=(text,chunkSize)=>{
    try{
const words=text.trim().split(/\s+/)
const chunks=[];
for(let i=0;i<words.length;i+=chunkSize){
    chunks.push(words.slice(i,i+chunkSize).join(" "))
}
return chunks
}
catch(error){
console.log(error.message)
return [];
}
}

module.exports.generateEmbedding = async (text) => {
  try {
    const model = await getEmbedder();

    const output = await model(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data); // vector (array of numbers)
  } catch (error) {
    console.error("Embedding error:", error.message);
    return null;
  }
};


module.exports.processChunks=async(chunks,pdf)=>{
try{
for(const chunk of chunks){
    const embedding=await module.exports.generateEmbedding(chunk)
await embeddingModel.create({
    pdf_id:pdf._id,
    embedding:embedding,
    content:chunk
})
}
}catch(error){
    console.log(error)
    
}
}


//Find accuracy between Two vector
module.exports.consineSimilarity=(vecA,vecB)=>{
    let dot=0.0;  //magnitude A 
let magA=0.0;
    let magB=0.0;
    for(let i=0;i<vecA.length;i++){
      dot+=vecA[i]*vecB[i];
      magA+=vecA[i]*vecA[i];
      magB+=vecB[i]*vecB[i];
    }
    return dot/(Math.sqrt(magA)*Math.sqrt(magB));
  }


module.exports.pdfChatAi=async(bestMatch,question)=>{
try{

const prompt=`You are an Ai assistant. Answer the user's question based on the provided context \n\nContext:\n${bestMatch.content}\n\nUser Question:\n${question}\n\nAI Response:`

try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ Updated model
      messages:
          [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: prompt }
        ],
      temperature: 0.7,
      max_tokens: 500,
    
    });

    return response.choices[0].message.content || 'I am not sure to Answer';
  } catch (error) {
    console.log(error.message);
    return null;
  }


}catch(error){
console.log(error.message)
  return null;
}
}

