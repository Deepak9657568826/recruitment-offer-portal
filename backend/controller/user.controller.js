const { model } = require("mongoose");
const { UserModel } = require("../model/users.model");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
    }
    bcrypt.hash(password, 5, async function (err, hash) {
      if (err) {
        res.status(500).json({ message: err.message });
      } else {
        const newUser = new UserModel({
          firstName,
          lastName,
          email,
          password: hash,
        });
        await newUser.save();
        res
          .status(201)
          .json({ message: "User created successfully", user: newUser });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createUser,
};
