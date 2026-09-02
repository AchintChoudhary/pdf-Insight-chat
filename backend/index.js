const dotenv = require("dotenv");
dotenv.config(); // Put 'At The Top' first to the environmental variable configuration.

const express = require("express");
const app = express();
const mongoose =require('mongoose')
const url = process.env.MONGO_URL; //CONNECT through URL
const cors=require('cors')
const userRoute=require('./routes/user.routes')
const adminRoute=require('./routes/admin.routes')
const chatRoute=require('./routes/chat.routes')
const aiRoute=require('./routes/ai.routes')
const cookieParser=require('cookie-parser')  //cookie-parser interect with cookies
const path=require('path')
app.use(cors())
app.use(express.json())  //This middleware automatically converts the JSON string into a JavaScript object
app.use(express.static(path.join(__dirname,'public')))

app.use(express.urlencoded({extended:true})) //It converts the form data into a JavaScript object
app.use(cookieParser())

app.use('/users',userRoute)
app.use('/admin',adminRoute)
app.use('/chat',chatRoute)
app.use('/ai',aiRoute)

mongoose.connect(url)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    // Your code for successful connection
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    // Your error handling code
  });

  




app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
