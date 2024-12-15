const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true,
        enum: ['admin', 'user']
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'add_item',
            'update_item',
            'archive_item',
            'delete_item',
            'borrow_item',
            'return_item',
            'add_user',
            'update_user',
            'archive_user'
        ]
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);
