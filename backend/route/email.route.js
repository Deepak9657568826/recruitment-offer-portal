const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { sendEmail } = require('../controller/email.controller');

const emailRouter = express.Router();

// Email routes require authentication
emailRouter.post('/sendEmail/:id', authMiddleware, sendEmail);

module.exports = {
  emailRouter,
};
