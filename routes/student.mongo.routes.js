const express = require('express');
const { getDashboardData, getTimetable } = require('../controllers/student.mongo.controller');
const { submitAssignment } = require('../controllers/assignment.mongo.controller');
const { authenticate, authorizeStudent } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/assignments/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only documents are allowed (pdf, doc, docx, txt, zip, rar)'));
        }
    }
});

const router = express.Router();

// Apply authentication and student authorization middleware to all routes
router.use(authenticate, authorizeStudent);

// Dashboard
router.get('/dashboard', getDashboardData);

// Assignment submission - use the real controller with file upload
router.post('/assignments/submit', upload.single('file'), submitAssignment);

// Timetable
router.get('/timetable', getTimetable);

module.exports = router;