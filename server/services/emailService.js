const nodemailer = require('nodemailer');

// Create transporter with more secure settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || '2201105150@student.buksu.edu.ph', // Use environment variable
        pass: process.env.EMAIL_APP_PASSWORD || 'dtcadwdafnwywvqr'  // Use environment variable
    },
    tls: {
        rejectUnauthorized: false // Add this for development
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('Email verification failed:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

const sendEmail = async ({ to, subject, text }) => {
    try {
        const info = await transporter.sendMail({
            from: {
                name: 'NSTP Inventory System',
                address: 'nstpinventory@buksu.edu.ph'
            },
            to,
            subject,
            text,
            priority: 'high',
            headers: {
                'X-Entity-Ref-ID': 'NSTP-Inventory'
            }
        });

        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

const getLoginNotificationEmail = (userName) => ({
    subject: '🔐 New Login Detected - NSTP Inventory System',
    text: `
        Hello ${userName},

        A new login was detected on your NSTP Inventory System account.

        Time: ${new Date().toLocaleString()}
        Action Required: If this wasn't you, please contact the administrator immediately.

        This is an automated message, please do not reply.
    `
});

const getNewItemNotificationEmail = (userName, itemName, itemLink) => ({
    subject: '📦 New Item Available - NSTP Inventory System',
    text: `
        Hello ${userName},

        A new item has been added to the inventory system.

        Item Name: ${itemName}
        Added on: ${new Date().toLocaleString()}
        View Item at: ${itemLink}

        This is an automated message, please do not reply.
    `
});

const getBorrowRequestStatusEmail = (userName, itemName, status, reason = '') => ({
    subject: `📋 Borrow Request ${status} - NSTP Inventory System`,
    text: `
        Hello ${userName},

        Your borrow request has been updated.

        Item: ${itemName}
        Status: ${status}
        ${reason ? `Reason: ${reason}\n` : ''}
        Updated on: ${new Date().toLocaleString()}

        This is an automated message, please do not reply.
    `
});

const getNewUserWelcomeEmail = (userName, email, temporaryPassword = null) => ({
    subject: '🎉 Welcome to NSTP Inventory System',
    text: `
        Hello ${userName},

        Welcome to the NSTP Inventory System! Your account has been created by an administrator.

        Your account details:
        - Email: ${email}
        ${temporaryPassword ? `- Temporary Password: ${temporaryPassword}\n        We recommend changing this password after your first login.` : '- You can log in using Google Authentication.'}

        You can access the system at: http://localhost:3000/login

        If you have any questions or need assistance, please contact the system administrator.

        This is an automated message, please do not reply.
    `
});

// Test email function
const testEmailService = async (testEmail) => {
    try {
        const result = await sendEmail({
            to: testEmail,
            subject: 'Test Email - NSTP Inventory System',
            text: `
                Test Email

                This is a test email from the NSTP Inventory System.
                Time sent: ${new Date().toLocaleString()}
            `
        });
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    getLoginNotificationEmail,
    getNewItemNotificationEmail,
    getBorrowRequestStatusEmail,
    getNewUserWelcomeEmail,
    testEmailService
};
