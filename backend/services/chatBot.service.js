
const chatBotModel=require('../models/chatBot.model.js')
module.exports.createChatBot = async ({
name,message,prompt_message,image
}) => {
  if (!name || !message || !prompt_message || !image) {
    throw new Error("All fields are required");
  }

  const chatBot =await  chatBotModel.create({
    name,message,prompt_message,image
  });
//    When you use Model.create() in Mongoose, it implicitly calls save() behind the scenes
  return chatBot;
};
