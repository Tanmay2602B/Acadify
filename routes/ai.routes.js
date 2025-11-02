const express = require('express');
const { askAI } = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// AI chatbot endpoint
router.post('/ask', askAI);

module.exports = router;