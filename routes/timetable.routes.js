const express = require('express');
const {
  createTimetableEntry,
  getTimetable,
  getFacultyTimetable,
  updateTimetableEntry,
  deleteTimetableEntry
} = require('../controllers/timetable.controller');
const { authenticate, authorizeAdmin, authorizeFaculty } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin routes
router.post('/', authorizeAdmin, createTimetableEntry);
router.put('/:id', authorizeAdmin, updateTimetableEntry);
router.delete('/:id', authorizeAdmin, deleteTimetableEntry);

// Public route to get timetable for a program and semester
router.get('/:program/:semester', getTimetable);

// Faculty route to get their timetable
router.get('/faculty', authorizeFaculty, getFacultyTimetable);

module.exports = router;