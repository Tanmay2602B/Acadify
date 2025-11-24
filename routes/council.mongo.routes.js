const express = require('express');
const {
  getCouncilMembers,
  addCouncilMember,
  updateCouncilMember,
  removeCouncilMember
} = require('../controllers/council.mongo.controller');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Public route to get all council members
router.get('/', getCouncilMembers);

// Admin routes
router.post('/', authorizeAdmin, addCouncilMember);
router.put('/:id', authorizeAdmin, updateCouncilMember);
router.delete('/:id', authorizeAdmin, removeCouncilMember);

module.exports = router;