const express = require('express');
const router = express.Router();
const { sendTestEmail } = require('../services/emailService');

// Test email endpoint
router.post('/send-test', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    try {
        console.log(`Attempting to send test email to: ${email}`);
        await sendTestEmail(email);
        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            message: 'Failed to send test email', 
            error: error.message 
        });
    }
});

module.exports = router; 