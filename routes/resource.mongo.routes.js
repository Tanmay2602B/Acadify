const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    uploadResource,
    getStudentResources,
    getFacultyResources,
    deleteResource,
    downloadResource
} = require('../controllers/resource.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/resources/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for resources
    fileFilter: (req, file, cb) => {
        // Allow more file types for resources
        const filetypes = /pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png|mp4|zip|rar/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not supported!'));
    }
});

// Routes
router.post('/upload', authenticate, authorizeFaculty, upload.single('file'), uploadResource);
router.get('/faculty', authenticate, authorizeFaculty, getFacultyResources);
router.get('/student', authenticate, authorizeStudent, getStudentResources);
router.delete('/:id', authenticate, authorizeFaculty, deleteResource);
router.get('/download/:id', authenticate, downloadResource);

module.exports = router;
