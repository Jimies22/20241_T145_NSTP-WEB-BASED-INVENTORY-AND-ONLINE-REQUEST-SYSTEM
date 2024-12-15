const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { jwtVerifyMiddleware, isAdmin } = require('../middleware/authMiddleware');

router.get('/', jwtVerifyMiddleware, isAdmin, async (req, res) => {
    try {
        const activities = await Activity.find({})
            .sort({ timestamp: -1 })
            .lean();
        
        res.json({ activities });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

router.post('/log', jwtVerifyMiddleware, async (req, res) => {
    try {
        const { action, details } = req.body;
        const userId = req.user.userId;
        const userName = req.user.name;
        const userRole = req.user.role;

        const activity = new Activity({
            userId,
            userName,
            userRole,
            action,
            details,
            timestamp: new Date()
        });

        await activity.save();
        
        res.status(200).json({ 
            message: 'Activity logged successfully',
            activity 
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({ 
            message: 'Error logging activity', 
            error: error.message 
        });
    }
});

module.exports = router;
