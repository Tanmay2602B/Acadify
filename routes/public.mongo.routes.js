const express = require('express');
const router = express.Router();
const User = require('../models/User.mongo');
const Resource = require('../models/Resource.mongo');
const Meeting = require('../models/Meeting.mongo');

// Public endpoint for landing page stats (no authentication required)
router.get('/stats', async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const faculty = await User.countDocuments({ role: 'faculty' });
        const resources = await Resource.countDocuments();

        // Count meetings scheduled for this week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
        const meetingsThisWeek = await Meeting.countDocuments({
            date: { $gte: startOfWeek, $lte: endOfWeek }
        });

        res.json({
            students,
            faculty,
            resources,
            meetings: meetingsThisWeek
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
