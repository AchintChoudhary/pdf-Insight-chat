const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength:[3,'Firstname must be  at least 3 characters long']
    },
    lastname: {
      type: String,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase:true,
trim:true,
     minlength:[5,'Firstname must be  at least 5 characters long']
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  image:{
    type:String,
    required:true
  },
  is_admin:{
    type:Boolean,
    default:false
  }
},{timestamps:{createdAt:true, updatedAt:true }});

// Generates a JWT token for the user
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET,{expiresIn:'24h'});
  return token;
};

// Compares provided password with stored hashed password
    // Authentication (checking passwords)
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hashes a password (available on the User model itself, not instances)
    // Password storage preparation
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const userModel=mongoose.model('User',userSchema);

module.exports=userModel;


























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
