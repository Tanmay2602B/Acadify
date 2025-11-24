const express = require('express');
const {
  createMeeting,
  getFacultyMeetings,
  getStudentMeetings,
  joinMeeting,
  leaveMeeting,
  getMeetingDetails,
  endMeeting
} = require('../controllers/meeting.mongo.controller');
const { authenticate, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

// Faculty routes
router.post('/', authorizeFaculty, createMeeting);
router.get('/faculty', authorizeFaculty, getFacultyMeetings);
router.put('/:meeting_id/end', authorizeFaculty, endMeeting);

// Student routes
router.get('/student', authorizeStudent, getStudentMeetings);
router.post('/:meeting_id/join', authorizeStudent, joinMeeting);
router.post('/:meeting_id/leave', authorizeStudent, leaveMeeting);

// Common routes
router.get('/:meeting_id', getMeetingDetails);

module.exports = router;
