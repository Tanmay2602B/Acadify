const express = require('express');
const { getDashboardData, getTimetable } = require('../controllers/student.mongo.controller');
const { submitAssignment } = require('../controllers/assignment.mongo.controller');
const { authenticate, authorizeStudent } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Allowed MIME types for assignments
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/octet-stream' // For some file types
        ];

        // Check file extension as fallback
        const extname = /\.(pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png|zip|rar)$/i.test(file.originalname);

        if (allowedMimeTypes.includes(file.mimetype) || extname) {
            return cb(null, true);
        }
        cb(new Error('File type not supported! Allowed: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG, ZIP, RAR'));
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