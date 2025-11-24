const express = require('express');
const {
  generateTimetable,
  getTimetable,
  updateTimetableEntry
} = require('../controllers/timetable-generator.mongo.controller');
const { authenticate, authorizeFaculty, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin/Faculty routes
router.post('/generate', authorizeFaculty, generateTimetable);
router.put('/:timetable_id/entry/:entry_id', authorizeFaculty, updateTimetableEntry);

// All authenticated users can view timetable
router.get('/', getTimetable);

module.exports = router;
