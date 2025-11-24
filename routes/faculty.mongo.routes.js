const express = require('express');
const { getDashboardData, createAnnouncement } = require('../controllers/faculty.mongo.controller');
const { authenticate, authorizeFaculty } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and faculty authorization middleware to all routes
router.use(authenticate, authorizeFaculty);

// Dashboard
router.get('/dashboard', getDashboardData);

// Announcements
router.post('/announcements', createAnnouncement);

module.exports = router;