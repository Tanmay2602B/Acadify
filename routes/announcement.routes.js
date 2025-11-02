const express = require('express');
const {
  createAnnouncement,
  getStudentAnnouncements,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcement.controller');
const { authenticate, authorizeAdmin, authorizeFaculty, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin routes
router.post('/', authorizeAdmin, createAnnouncement);
router.get('/admin', authorizeAdmin, getAllAnnouncements);
router.put('/:id', authorizeAdmin, updateAnnouncement);
router.delete('/:id', authorizeAdmin, deleteAnnouncement);

// Faculty routes
router.post('/faculty', authorizeFaculty, createAnnouncement);
router.put('/faculty/:id', authorizeFaculty, updateAnnouncement);
router.delete('/faculty/:id', authorizeFaculty, deleteAnnouncement);

// Student routes
router.get('/student', authorizeStudent, getStudentAnnouncements);

module.exports = router;