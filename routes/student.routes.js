const express = require('express');
const {
  getDashboardData,
  submitAssignment,
  getTimetable
} = require('../controllers/student.controller');
const { getStudentResources } = require('../controllers/resource.controller');
const { authenticate, authorizeStudent } = require('../middlewares/auth');
const multer = require('multer');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/submissions/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Apply authentication and student authorization middleware to all routes
router.use(authenticate, authorizeStudent);

// Dashboard
router.get('/dashboard', getDashboardData);

// Resources
router.get('/resources', getStudentResources);

// Assignment submission
router.post('/assignments', upload.single('file'), submitAssignment);

// Timetable
router.get('/timetable', getTimetable);

module.exports = router;