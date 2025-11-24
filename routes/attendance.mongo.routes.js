const express = require('express');
const {
  markAttendance,
  getStudentAttendance,
  getFacultyAttendanceReport,
  getAdminAttendanceReport
} = require('../controllers/attendance.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Faculty routes
router.post('/mark', authorizeFaculty, markAttendance);
router.get('/faculty/report', authorizeFaculty, getFacultyAttendanceReport);

// Student routes
router.get('/student', authorizeStudent, getStudentAttendance);

// Admin routes
router.get('/admin/report', authorizeAdmin, getAdminAttendanceReport);

module.exports = router;