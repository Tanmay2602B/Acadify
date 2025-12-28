const express = require('express');
const {
  saveTimetable,
  getTimetable,
  publishTimetable,
  deleteTimetable
} = require('../controllers/timetable.mongo.controller');
const { authenticate, authorizeAdmin, authorizeFaculty } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

// Admin and Faculty can manage timetables
router.post('/', authorizeFaculty, saveTimetable);
router.get('/', getTimetable);
router.put('/:timetable_id/publish', authorizeFaculty, publishTimetable);
router.delete('/:timetable_id', authorizeAdmin, deleteTimetable);

module.exports = router;
