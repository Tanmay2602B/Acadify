const { getAcademicAIResponse } = require('../utils/aiChatbot');
const Joi = require('joi');

// Validation schema
const aiQuestionSchema = Joi.object({
  question: Joi.string().min(5).required(),
  subject: Joi.string().optional(),
  level: Joi.string().optional().valid('beginner', 'intermediate', 'advanced').default('beginner')
});

// Handle AI chatbot questions
const askAI = async (req, res) => {
  try {
    // Validate request body
    const { error } = aiQuestionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const { question, subject = 'general', level } = req.body;
    
    // Get AI response
    const response = await getAcademicAIResponse(question, subject, level);
    
    res.json({
      question,
      subject,
      level,
      response
    });
  } catch (error) {
    console.error('AI Chatbot Error:', error);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
};

module.exports = {
  askAI
};