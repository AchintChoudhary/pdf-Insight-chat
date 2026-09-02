const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const multer=require('multer')
const path = require('path');
const adminController=require('../controllers/admin.controller.js')
const AdminauthMiddleware=require('../middlewares/adminAuth.middleware.js')



//CB------CallBack
const storage=multer.diskStorage({
    destination: function(req,file,cb){
if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
    cb(null,path.join(__dirname,'../public/images'))
}
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})


const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
    cb(null,true)
}else{
    cb(null,false)
}
}

const upload=multer({
    storage:storage,
    fileFilter:fileFilter
})


//npm i express validator

router.post('/add-chat-bot',upload.single('image') ,[
 body("name").isLength({ min: 3 }).withMessage("name must be at least 3 character long"),
  body('message').notEmpty().withMessage('messsage is required'),
  body('prompt_message').notEmpty().withMessage('prompt_message is required'),
 body('image').custom((value, { req }) => {
  if (!req.file) {
    throw new Error('Image is required');
  }

  if (
    req.file.mimetype === 'image/jpeg' ||
    req.file.mimetype === 'image/png'
  ) {
    return true;
  }

  throw new Error('Please upload jpeg or png image');
})
.withMessage('Please upload an image jpeg,png')
],AdminauthMiddleware.authAdmin,adminController.addChatBot )


router.get('/get-chat-bot',AdminauthMiddleware.authAdmin,adminController.getChatBot)

router.put('/update-chat-bot',AdminauthMiddleware.authAdmin,upload.single('image'),[body('id').notEmpty().withMessage('id is required'),body("name").isLength({ min: 3 }).withMessage("name must be at least 3 character long"),
  body('message').notEmpty().withMessage('messsage is required'),
  body('prompt_message').notEmpty().withMessage('prompt_message is required')],adminController.updateChatBot)

router.delete('/delete-chat-bot',AdminauthMiddleware.authAdmin,[body('id').notEmpty().withMessage('id is required').trim()],adminController.deleteChatBot)



module.exports = router;
