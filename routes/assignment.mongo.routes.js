const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    uploadAssignment,
    getFacultyAssignments,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission
} = require('../controllers/assignment.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/assignments/');
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx|txt/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports PDF, DOC, PPT, and TXT!'));
    }
});

// Routes
router.post('/upload', authenticate, authorizeFaculty, upload.single('file'), uploadAssignment);
router.post('/submit', authenticate, authorizeStudent, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
            }
            return res.status(400).json({ message: 'File upload error: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, submitAssignment);
router.get('/faculty', authenticate, authorizeFaculty, getFacultyAssignments);
router.get('/student', authenticate, authorizeStudent, getStudentAssignments);
router.get('/:assignmentId/submissions', authenticate, authorizeFaculty, getAssignmentSubmissions);
router.post('/:assignmentId/grade', authenticate, authorizeFaculty, gradeSubmission);

module.exports = router;
