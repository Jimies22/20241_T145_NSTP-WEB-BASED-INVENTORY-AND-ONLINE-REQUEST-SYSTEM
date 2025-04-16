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

// Base HTML template for all emails
const baseEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .title {
            color: #2980b9;
            font-size: 22px;
            margin-top: 0;
        }
        .content {
            padding: 20px 0;
        }
        .info-block {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            color: #7f8c8d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(45deg, #1e5799, #2989d8, #207cca, #7db9e8);
            color: white;
            padding: 14px 28px;
            margin: 20px 0;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s, box-shadow 0.3s;
            border: 2px solid transparent;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .hero-button {
            display: block;
            width: 80%;
            max-width: 300px;
            margin: 30px auto;
            background: linear-gradient(45deg, #0a2463, #3e92cc);
            color: #ffffff;
            padding: 16px 24px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 900;
            font-size: 18px;
            text-align: center;
            box-shadow: 0 6px 15px rgba(0, 161, 255, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.4);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.3s ease;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        }
        .hero-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 161, 255, 0.6), inset 0 0 0 2px rgba(255, 255, 255, 0.6);
        }
        .hero-button::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: rgba(255, 255, 255, 0.1);
            transform: rotate(30deg);
            transition: transform 0.5s ease;
        }
        .alert {
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .alert-warning {
            background-color: #fcf8e3;
            border-left: 4px solid #f39c12;
        }
        .alert-success {
            background-color: #dff0d8;
            border-left: 4px solid #27ae60;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NSTP Inventory System</div>
            <h1 class="title">${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated message from NSTP Inventory System. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} BukSU NSTP Department. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: {
                name: 'NSTP Inventory System',
                address: 'nstpinventory@buksu.edu.ph'
            },
            to,
            subject,
            text: text || '', // Fallback plain text
            html: html || '', // HTML version
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

const getLoginNotificationEmail = (userName) => {
    const content = `
        <div class="alert alert-warning">
            <p><strong>Alert:</strong> A new login was detected on your NSTP Inventory System account.</p>
        </div>
        <div class="info-block">
            <div class="info-item">
                <span class="label">User:</span>
                <span class="value">${userName}</span>
            </div>
            <div class="info-item">
                <span class="label">Time:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">Action Required:</span>
                <span class="value">If this wasn't you, please contact the administrator immediately.</span>
            </div>
        </div>
    `;
    
    return {
    subject: '🔐 New Login Detected - NSTP Inventory System',
        text: `Hello ${userName}, A new login was detected on your NSTP Inventory System account. Time: ${new Date().toLocaleString()}. Action Required: If this wasn't you, please contact the administrator immediately. This is an automated message, please do not reply.`,
        html: baseEmailTemplate('New Login Detected', content)
    };
};

const getNewItemNotificationEmail = (userName, itemName, itemLink) => {
    const content = `
        <p>Hello ${userName},</p>
        <p>We're excited to inform you that a new item has been added to our inventory system!</p>
        <div class="info-block">
            <div class="info-item">
                <span class="label">Item Name:</span>
                <span class="value">${itemName}</span>
            </div>
            <div class="info-item">
                <span class="label">Added on:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
        </div>
        <p>
            <a href="${itemLink}" class="button">View Item Details</a>
        </p>
    `;
    
    return {
        subject: '📦 New Item Available - NSTP Inventory System',
        text: `Hello ${userName}, A new item has been added to the inventory system. Item Name: ${itemName}, Added on: ${new Date().toLocaleString()}, View Item at: ${itemLink}. This is an automated message, please do not reply.`,
        html: baseEmailTemplate('New Item Available', content)
    };
};

const getBorrowRequestStatusEmail = (userName, itemName, status, reason = '') => {
    let statusClass = 'alert-warning';
    let statusEmoji = '📋';
    
    if (status.toLowerCase() === 'approved') {
        statusClass = 'alert-success';
        statusEmoji = '✅';
    } else if (status.toLowerCase() === 'rejected') {
        statusClass = 'alert-warning';
        statusEmoji = '❌';
    }
    
    const content = `
        <p>Hello ${userName},</p>
        <p>Your borrow request has been updated.</p>
        
        <div class="alert ${statusClass}">
            <p><strong>Status Update: ${status.toUpperCase()}</strong></p>
        </div>
        
        <div class="info-block">
            <div class="info-item">
                <span class="label">Item:</span>
                <span class="value">${itemName}</span>
            </div>
            <div class="info-item">
                <span class="label">Status:</span>
                <span class="value">${statusEmoji} ${status}</span>
            </div>
            ${reason ? `
            <div class="info-item">
                <span class="label">Reason:</span>
                <span class="value">${reason}</span>
            </div>
            ` : ''}
            <div class="info-item">
                <span class="label">Updated on:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
        </div>
    `;
    
    return {
        subject: `${statusEmoji} Borrow Request ${status.toUpperCase()} - NSTP Inventory System`,
        text: `Hello ${userName}, Your borrow request has been updated. Item: ${itemName}, Status: ${status}, ${reason ? `Reason: ${reason}, ` : ''}Updated on: ${new Date().toLocaleString()}. This is an automated message, please do not reply.`,
        html: baseEmailTemplate(`Borrow Request ${status.toUpperCase()}`, content)
    };
};

const getItemReturnedEmail = (userName, itemName, borrowDate, returnDate) => {
    const content = `
        <p>Hello ${userName},</p>
        <div class="alert alert-success">
            <p><strong>Success!</strong> We're confirming that you have successfully returned the following item to the NSTP Inventory.</p>
        </div>
        
        <div class="info-block">
            <div class="info-item">
                <span class="label">Item:</span>
                <span class="value">${itemName}</span>
            </div>
            <div class="info-item">
                <span class="label">Borrowed On:</span>
                <span class="value">${new Date(borrowDate).toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">Returned On:</span>
                <span class="value">${new Date(returnDate).toLocaleString()}</span>
            </div>
        </div>
        
        <p>Thank you for returning the item in a timely manner. Your responsibility for this item has ended.</p>
        <p>If you have any questions about this return or need to borrow equipment in the future, please visit the NSTP office.</p>
    `;
    
    return {
        subject: '✅ Item Successfully Returned - NSTP Inventory System',
        text: `Hello ${userName}, We're confirming that you have successfully returned the following item to the NSTP Inventory: Item: ${itemName}, Borrowed On: ${new Date(borrowDate).toLocaleString()}, Returned On: ${new Date(returnDate).toLocaleString()}. Thank you for returning the item in a timely manner. Your responsibility for this item has ended. If you have any questions about this return or need to borrow equipment in the future, please visit the NSTP office. This is an automated message, please do not reply.`,
        html: baseEmailTemplate('Item Successfully Returned', content)
    };
};

const getNewUserWelcomeEmail = (userName, email, temporaryPassword = null) => {
    const content = `
        <p>Hello ${userName},</p>
        <div class="alert alert-success">
            <p><strong>Welcome!</strong> Your account has been created by an administrator.</p>
        </div>
        
        <div class="info-block">
            <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
            </div>
            ${temporaryPassword ? `
            <div class="info-item">
                <span class="label">Temporary Password:</span>
                <span class="value">${temporaryPassword}</span>
            </div>
            <p><em>We recommend changing this password after your first login.</em></p>
            ` : `
            <div class="info-item">
                <span class="label">Authentication:</span>
                <span class="value">You can log in using Google Authentication.</span>
            </div>
            `}
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
            <!-- Button with gradient background, white text, and moderate size -->
            <a href="http://localhost:3001/login" style="display: inline-block; width: auto; min-width: 180px; max-width: 240px; background: linear-gradient(to right, #1e5799, #2989d8); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">
                ACCESS THE SYSTEM
            </a>
        </div>
        
        <p>If you have any questions or need assistance, please contact the system administrator.</p>
    `;
    
    return {
        subject: '🎉 Welcome to NSTP Inventory System',
        text: `Hello ${userName}, Welcome to the NSTP Inventory System! Your account has been created by an administrator. Your account details: - Email: ${email} ${temporaryPassword ? `- Temporary Password: ${temporaryPassword} We recommend changing this password after your first login.` : '- You can log in using Google Authentication.'} You can access the system at: http://localhost:3001/login. If you have any questions or need assistance, please contact the system administrator. This is an automated message, please do not reply.`,
        html: baseEmailTemplate('Welcome to NSTP Inventory System', content)
    };
};

// Test email function
const testEmailService = async (testEmail) => {
    try {
        const content = `
            <div class="alert alert-success">
                <p><strong>Success!</strong> This is a test email from the NSTP Inventory System.</p>
            </div>
            <div class="info-block">
                <div class="info-item">
                    <span class="label">Time sent:</span>
                    <span class="value">${new Date().toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="label">Message:</span>
                    <span class="value">If you are seeing this email, the email system is working correctly!</span>
                </div>
            </div>
            <p>
                <a href="http://localhost:3000" class="button">Visit the Application</a>
            </p>
        `;
        
        const result = await sendEmail({
            to: testEmail,
            subject: 'Test Email - NSTP Inventory System',
            text: `Test Email. This is a test email from the NSTP Inventory System. Time sent: ${new Date().toLocaleString()}`,
            html: baseEmailTemplate('Test Email', content)
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
    getItemReturnedEmail,
    testEmailService
};
