const express = require('express');
const { createUser } = require('../controller/user.controller');
const { login } = require('../controller/auth.controller');

const authRouter = express.Router()

authRouter.post("/login", login)

module.exports = {
    authRouter
}   

