const express = require('express');
const { getDashboardData, submitAssignment, getTimetable } = require('../controllers/student.mongo.controller');
const { authenticate, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and student authorization middleware to all routes
router.use(authenticate, authorizeStudent);

// Dashboard
router.get('/dashboard', getDashboardData);

// Assignment submission
router.post('/assignments/submit', submitAssignment);

// Timetable
router.get('/timetable', getTimetable);

module.exports = router;