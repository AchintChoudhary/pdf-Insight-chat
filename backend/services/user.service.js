const userModel = require("../models/user.model");

module.exports.createUser = async ({
  firstname,
  lastname,
email,
image,
  password,
}) => {
  if (!firstname || !email || !password || !image) {
    throw new Error("All fields are required");
  }

  const user = userModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    image,
    password,
  });
//    When you use Model.create() in Mongoose, it implicitly calls save() behind the scenes
  return user;
};
