const Activity = require('../models/Activity');

const logActivity = async (userId, userName, userRole, action, details) => {
    try {
        const activity = new Activity({
            userId,
            userName,
            userRole,
            action,
            details,
            timestamp: new Date()
        });
        
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Server-side activity logging error:', error);
        throw error;
    }
};

module.exports = { logActivity };
