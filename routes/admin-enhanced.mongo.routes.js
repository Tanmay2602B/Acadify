const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    // Faculty management
    createFaculty,
    getAllFaculty,
    getFacultyCredentials,
    updateFacultyStatus,
    deleteFaculty,
    // Student management
    createStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
    getStudentCredentials,
    // Program management
    createProgram,
    getAllPrograms,
    updateProgram,
    deleteProgram
} = require('../controllers/admin-enhanced.mongo.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

// Dashboard
router.get('/dashboard', authenticate, authorizeAdmin, getDashboardStats);

// Faculty routes
router.post('/faculty/create', authenticate, authorizeAdmin, createFaculty);
router.get('/faculty/list', authenticate, authorizeAdmin, getAllFaculty);
router.get('/faculty/credentials', authenticate, authorizeAdmin, getFacultyCredentials);
router.put('/faculty/:facultyId/status', authenticate, authorizeAdmin, updateFacultyStatus);
router.delete('/faculty/:id', authenticate, authorizeAdmin, deleteFaculty);

// Student routes
router.post('/students/create', authenticate, authorizeAdmin, createStudent);
router.get('/students/list', authenticate, authorizeAdmin, getAllStudents);
router.get('/students/credentials', authenticate, authorizeAdmin, getStudentCredentials);
router.put('/students/:id', authenticate, authorizeAdmin, updateStudent);
router.delete('/students/:id', authenticate, authorizeAdmin, deleteStudent);

// Program routes
router.post('/programs/create', authenticate, authorizeAdmin, createProgram);
router.get('/programs/list', authenticate, authorizeAdmin, getAllPrograms);
router.put('/programs/:id', authenticate, authorizeAdmin, updateProgram);
router.delete('/programs/:id', authenticate, authorizeAdmin, deleteProgram);

module.exports = router;
