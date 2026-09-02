const mongoose = require("mongoose");


const conversationSchema = new mongoose.Schema({
 user_id:{
type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'User'
 },
  

last_message:{
    type:String,
    default:''
}


},{timestamps:{createdAt:true, updatedAt:true }});


const PdfConversationModel=mongoose.model('PdfConversation',conversationSchema);

module.exports=PdfConversationModel;


























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
