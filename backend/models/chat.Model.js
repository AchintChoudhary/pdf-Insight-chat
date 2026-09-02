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
ref:'Conversation'
},

chat_bot_id:{
    type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'ChatBot'
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







// // Generates a JWT token for the user
// userSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET,{expiresIn:'24h'});
//   return token;
// };

// // Compares provided password with stored hashed password
//     // Authentication (checking passwords)
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Hashes a password (available on the User model itself, not instances)
//     // Password storage preparation
// userSchema.statics.hashPassword = async function (password) {
//   return await bcrypt.hash(password, 10);
// };

const chatModel=mongoose.model('Chat',chatSchema);

module.exports=chatModel;


























// generateAuthToken() Method
// Purpose: Creates a secure token that identifies the user (for authentication).

// How it works:

// jwt.sign() is called to create a JSON Web Token (JWT)

// It takes two main parameters:

// The payload ({ _id: this._id }): This stores the user's database ID in the token

// The secret key (process.env.JWT_SECRET): A private key from your environment variables

// The token is then returned

// ---------------------------------------------

// comparePassword() Method
// Purpose: Safely checks if a provided password matches the stored hashed password.

// How it works:

// Takes the plain text password from login attempt

// Uses bcrypt.compare() to:

// Take the plain password

// Hash it with the same salt used for the stored password

// Compare the resulting hash with the stored hash

// Returns true if they match, false if not
