const mongoose = require("mongoose");

const chatBotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    prompt_message: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status:{
        type:Number,
        enum:[0,1],     //0-->Disable 1--->Eable
    default:1
      }
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

chatBotSchema.virtual("fullImageUrl").get(function(){
  const baseUrl=process.env.BASE_URL;
  return this.image.startsWith('http')?this.image:`${baseUrl}${this.image}`
})
chatBotSchema.set('toJSON',{virtuals:true})
chatBotSchema.set('toObject',{virtuals:true})
const chatBotModel = mongoose.model("ChatBot", chatBotSchema);
module.exports = chatBotModel;

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
