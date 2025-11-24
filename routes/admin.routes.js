const express = require('express');
const {
  getDashboardStats,
  getAllStudents,
  getAllFaculty,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  generateStudentReport,
  generateFacultyReport,
  generateProgramReport,
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram,
  createSemester,
  getAllSemesters,
  updateSemester,
  deleteSemester
} = require('../controllers/admin.controller');
const { 
  createTimetableEntry,
  getTimetable,
  updateTimetableEntry,
  deleteTimetableEntry
} = require('../controllers/timetable.mongo.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and admin authorization middleware to all routes
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/students', getAllStudents);
router.get('/faculty', getAllFaculty);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/search', searchUsers);

// Announcement management
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAllAnnouncements);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Report generation
router.get('/reports/students', generateStudentReport);
router.get('/reports/faculty', generateFacultyReport);
router.get('/reports/programs', generateProgramReport);

// Timetable management
router.post('/timetable', createTimetableEntry);
router.put('/timetable/:id', updateTimetableEntry);
router.delete('/timetable/:id', deleteTimetableEntry);

// Program management
router.post('/programs', createProgram);
router.get('/programs', getAllPrograms);
router.put('/programs/:id', updateProgram);
router.delete('/programs/:id', deleteProgram);

// Semester management
router.post('/semesters', createSemester);
router.get('/semesters', getAllSemesters);
router.put('/semesters/:id', updateSemester);
router.delete('/semesters/:id', deleteSemester);

module.exports = router;