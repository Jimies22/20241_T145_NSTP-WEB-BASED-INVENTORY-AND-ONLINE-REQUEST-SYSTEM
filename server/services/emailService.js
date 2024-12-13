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

const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log('Attempting to send email:', {
            to,
            subject,
            transporterConfig: {
                host: transporter.options.host,
                port: transporter.options.port,
                secure: transporter.options.secure,
                auth: {
                    user: transporter.options.auth.user,
                    // Don't log the password
                }
            }
        });

        const info = await transporter.sendMail({
            from: '"NSTP Inventory System" <admin@buksu.edu.ph>',
            to,
            subject,
            html,
            text: html.replace(/<[^>]*>/g, ''),
            priority: 'high'
        });

        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', {
            error: error.message,
            stack: error.stack,
            errorCode: error.code,
            errorResponse: error.response
        });
        throw error;
    }
};


const getLoginNotificationEmail = (userName) => ({
    subject: '🔐 New Login Detected - NSTP Inventory System',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hello ${userName},</h2>
            <p style="color: #34495e;">A new login was detected on your NSTP Inventory System account.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 10px 0 0 0;"><strong>Action Required:</strong> If this wasn't you, please contact the administrator immediately.</p>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
    `
});

const getNewItemNotificationEmail = (userName, itemName, itemLink) => ({
    subject: '📦 New Item Available - NSTP Inventory System',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hello ${userName},</h2>
            <p style="color: #34495e;">A new item has been added to the inventory system.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Item Name:</strong> ${itemName}</p>
                <p style="margin: 10px 0;"><strong>Added on:</strong> ${new Date().toLocaleString()}</p>
                <a href="${itemLink}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Item</a>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
    `
});

const getBorrowRequestStatusEmail = (userName, itemName, status, reason = '') => ({
    subject: `📋 Borrow Request ${status} - NSTP Inventory System`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hello ${userName},</h2>
            <p style="color: #34495e;">Your borrow request has been updated.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Item:</strong> ${itemName}</p>
                <p style="margin: 10px 0;"><strong>Status:</strong> ${status}</p>
                ${reason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
                <p style="margin: 10px 0;"><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated message, please do not reply.</p>
        </div>
    `
});

// Test email function
const testEmailService = async (testEmail) => {
    try {
        const result = await sendEmail({
            to: testEmail,
            subject: 'Test Email - NSTP Inventory System',
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Test Email</h2>
                    <p>This is a test email from the NSTP Inventory System.</p>
                    <p>Time sent: ${new Date().toLocaleString()}</p>
                </div>
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
    testEmailService
};
