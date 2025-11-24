const express = require('express');
const {
  createQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizResult
} = require('../controllers/quiz.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

// Faculty routes
router.post('/', authorizeFaculty, createQuiz);
router.get('/:exam_id/results', authorizeFaculty, getQuizResults);

// Student routes
router.post('/:exam_id/submit', authorizeStudent, submitQuiz);
router.get('/:exam_id/result', authorizeStudent, getStudentQuizResult);

module.exports = router;
