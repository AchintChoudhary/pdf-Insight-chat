const express = require("express");
const router = express.Router();
const { body, check } = require("express-validator");
const User=require('../models/user.model.js')
const userController=require('../controllers/user.controller.js')
const authMiddleware=require('../middlewares/auth.middleware')
const uploadMiddleware=require('../utils/imageUpload.js')
//npm i express validator
router.post("/register",uploadMiddleware, [
  body("email").isEmail().withMessage("Invalid Email").custom(
    async(email)=>{
const existingUser=await User.findOne({email})

if(existingUser){
throw new Error('email Already in use')
}

    }
  ),
  body("fullname.firstname").isLength({ min: 3 }).withMessage("First name must be at least 3 character long"),check("image").custom((value,{req})=>{
    if(!req.file){
      throw new Error("image Fle is required");
      
    }
  return true;
  }
  ),
  body('password').isLength({min:8}).withMessage('Password must be at least 8 character long'),
],userController.registerUser);


router.post("/login", [
  body("email").isEmail().withMessage("Invalid Email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 character long")
], userController.loginUser);

router.get('/profile',authMiddleware.authUser,userController.getUserProfile)

router.get('/logout', authMiddleware.authUser, userController.logoutUser);

// router.get('/get-chat-bot',authMiddleware.authUser,userController.getChatBot)

module.exports = router;
