const express = require('express');
const {
  generateReportCard,
  bulkGenerateReportCards,
  getStudentReportCard,
  publishReportCard,
  getAllReportCards
} = require('../controllers/reportcard.mongo.controller');
const { authenticate, authorizeFaculty, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin/Faculty routes
router.post('/generate', authorizeFaculty, generateReportCard);
router.post('/bulk-generate', authorizeFaculty, bulkGenerateReportCards);
router.put('/:report_id/publish', authorizeFaculty, publishReportCard);
router.get('/all', authorizeFaculty, getAllReportCards);

// Student routes
router.get('/student', getStudentReportCard);

module.exports = router;
