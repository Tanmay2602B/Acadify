const express = require('express');
const {
  createExam,
  addQuestion,
  getFacultyExams,
  getExamDetails,
  submitExam,
  getExamResults
} = require('../controllers/exam.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Faculty routes
router.post('/', authorizeFaculty, createExam);
router.post('/:examId/questions', authorizeFaculty, addQuestion);
router.get('/faculty', authorizeFaculty, getFacultyExams);
router.get('/:examId', authorizeFaculty, getExamDetails);
router.get('/:examId/results', authorizeFaculty, getExamResults);

// Student routes
router.get('/:examId/student', authorizeStudent, getExamDetails);
router.post('/:examId/submit', authorizeStudent, submitExam);
router.get('/:examId/results/student', authorizeStudent, getExamResults);

module.exports = router;