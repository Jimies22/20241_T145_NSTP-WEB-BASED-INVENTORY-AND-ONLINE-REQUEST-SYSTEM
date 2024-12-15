const Activity = require('../models/Activity');

const activityService = {
    logActivity: async (userId, userName, userRole, action, details) => {
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
            console.error('Error logging activity:', error);
            throw error;
        }
    }
};

module.exports = activityService;
