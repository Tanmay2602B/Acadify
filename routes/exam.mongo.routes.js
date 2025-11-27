const express = require('express');
const {
  createExam,
  addQuestion,
  getFacultyExams,
  getStudentExams,
  getExamDetails,
  submitExam,
  getExamResults,
  publishExam,
  uploadQuestionImage,
  deleteExam
} = require('../controllers/exam.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/quiz-images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Apply authentication middleware to all routes
router.use(authenticate);

// Faculty routes
router.post('/create', authorizeFaculty, createExam);
router.post('/upload-image', authorizeFaculty, upload.single('image'), uploadQuestionImage);
router.post('/:exam_id/questions', authorizeFaculty, addQuestion);
router.put('/:exam_id/publish', authorizeFaculty, publishExam);
router.delete('/:exam_id', authorizeFaculty, deleteExam);
router.get('/faculty', authorizeFaculty, getFacultyExams);
router.get('/:exam_id/results', getExamResults);

// Student routes
router.get('/student/list', authorizeStudent, getStudentExams);
router.get('/:exam_id', getExamDetails);
router.post('/:exam_id/submit', authorizeStudent, submitExam);

module.exports = router;