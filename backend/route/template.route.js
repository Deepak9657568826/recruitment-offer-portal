const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { getTemplate, updateTemplate } = require('../controller/template.controller');

const templateRouter = express.Router();

templateRouter.get('/emailTemplate', authMiddleware, getTemplate);
templateRouter.patch('/emailTemplate', authMiddleware, updateTemplate);

module.exports = { templateRouter };
