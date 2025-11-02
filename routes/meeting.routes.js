const express = require('express');
const {
  scheduleMeeting,
  getFacultyMeetings,
  getStudentMeetings,
  joinMeeting
} = require('../controllers/meeting.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Faculty routes
router.post('/schedule', authorizeFaculty, scheduleMeeting);
router.get('/faculty', authorizeFaculty, getFacultyMeetings);

// Student routes
router.get('/student', authorizeStudent, getStudentMeetings);

// Join meeting (both faculty and students)
router.get('/:meetingId/join', joinMeeting);

module.exports = router;