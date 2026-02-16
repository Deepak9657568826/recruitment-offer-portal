const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { sendEmail, sendBulkEmail } = require('../controller/email.controller');

const emailRouter = express.Router();

// Email routes require authentication
emailRouter.post('/sendEmail/:id', authMiddleware, sendEmail);
emailRouter.post('/sendBulkEmail', authMiddleware, sendBulkEmail);

module.exports = {
  emailRouter,
};
