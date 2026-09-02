const express = require("express");
const router = express.Router();
const { body,query } = require("express-validator");
const User=require('../models/user.model.js')
const chatController=require('../controllers/chat.controller.js')
const authMiddleware=require('../middlewares/auth.middleware.js')
//npm i express validator





router.post('/send-messages',[body('chat_bot_id').notEmpty().withMessage('chat_bot_id is required').trim(),body('message').notEmpty().withMessage('message is required')],authMiddleware.authUser,chatController.sendMessage)


router.get('/get-messages',authMiddleware.authUser,[query('conversation_id').notEmpty().withMessage('conversation_id is required').trim()],chatController.getMessages)
    





module.exports = router;
