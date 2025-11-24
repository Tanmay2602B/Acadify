const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    uploadAssignment,
    getFacultyAssignments,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions
} = require('../controllers/assignment.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/assignments/');
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
router.post('/submit', authenticate, authorizeStudent, upload.single('file'), submitAssignment);
router.get('/faculty', authenticate, authorizeFaculty, getFacultyAssignments);
router.get('/student', authenticate, authorizeStudent, getStudentAssignments);
router.get('/:assignmentId/submissions', authenticate, authorizeFaculty, getAssignmentSubmissions);

module.exports = router;
