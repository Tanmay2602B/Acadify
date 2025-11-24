const express = require('express');
const multer = require('multer');
const {
  importStudents,
  confirmImportStudents,
  importFaculty,
  confirmImportFaculty,
  downloadTemplate
} = require('../controllers/admin-import.mongo.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

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

// Apply authentication and authorization
router.use(authenticate);
router.use(authorizeAdmin);

// Import routes
router.post('/import/students', upload.single('file'), importStudents);
router.post('/import/students/confirm', confirmImportStudents);
router.post('/import/faculty', upload.single('file'), importFaculty);
router.post('/import/faculty/confirm', confirmImportFaculty);

// Template download
router.get('/template/:type', downloadTemplate);

module.exports = router;
