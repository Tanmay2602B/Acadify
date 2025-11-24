const express = require('express');
const {
  getDashboardData,
  createAnnouncement
} = require('../controllers/faculty.controller');
const { uploadResource, getFacultyResources } = require('../controllers/resource.mongo.controller');
const { authenticate, authorizeFaculty } = require('../middlewares/auth');
const multer = require('multer');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Apply authentication and faculty authorization middleware to all routes
router.use(authenticate, authorizeFaculty);

// Dashboard
router.get('/dashboard', getDashboardData);

// Resource management
router.post('/resources', upload.single('file'), uploadResource);
router.get('/resources', getFacultyResources);

// Announcements
router.post('/announcements', createAnnouncement);

module.exports = router;