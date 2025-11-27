const express = require('express');
const {
  bulkAddStudents,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentCredentials
} = require('../controllers/bulk-student.mongo.controller');
const { authenticate, authorizeFaculty, authorizeAdmin } = require('../middlewares/auth');

const multer = require('multer');
const {
  importStudents,
  confirmImportStudents
} = require('../controllers/admin-import.mongo.controller');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Faculty/Admin routes
router.post('/bulk', authorizeFaculty, bulkAddStudents);
router.post('/upload', authorizeFaculty, upload.single('file'), importStudents);
router.post('/confirm', authorizeFaculty, confirmImportStudents);
router.get('/', authorizeFaculty, getAllStudents);
router.get('/credentials', authorizeFaculty, getStudentCredentials);
router.get('/:student_id', authorizeFaculty, getStudentById);
router.put('/:student_id', authorizeFaculty, updateStudent);
router.delete('/:student_id', authorizeFaculty, deleteStudent);

module.exports = router;
