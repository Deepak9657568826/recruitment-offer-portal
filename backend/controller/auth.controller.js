const { UserModel } = require("../model/users.model");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
require('dotenv').config()

const login = async (req, res)=>{
    const { email, password } = req.body;
    console.log("email, password", email, password)
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await UserModel.findOne({ email });
        console.log("user", user)
        if(!user){
            res.status(400).json({ message: "User not found, please register first" });
        }
        bcrypt.compare(password, user.password, function(err, result) {
         if(err){
            res.status(500).json({ message: err.message });
         }else if (result){
            var token = jwt.sign({ user }, process.env.JWT_SECRET_KEY);
            res.status(200).json({ message: "Login successful", user, token });
         }else{
            res.status(400).json({ message: "Invalid password" });
         }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    login
}