const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendEmail, getLoginNotificationEmail } = require('../services/emailService');
const bcrypt = require('bcrypt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Regular login route
router.post('/', async (req, res) => {
    try {
        console.log('Login attempt:', req.body.email);
        const { email, password } = req.body;

        // Debug logs
        console.log('Login attempt with:', { email, password: '***' });

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user in database
        const user = await User.findOne({ email });
        console.log('Found user:', user ? 'Yes' : 'No');
        console.log('Stored password hash:', user?.password);

        // Check if user exists
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Make sure both password and hash exist before comparing
        if (!password || !user.password) {
            console.log('Missing password or hash');
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful:', email);

        // After successful login, before sending response
        try {
            await sendEmail({
                to: user.email,
                ...getLoginNotificationEmail(user.name || user.email)
            });
            console.log('Login notification email sent to:', user.email);
        } catch (emailError) {
            console.error('Failed to send login notification:', emailError);
            // Don't block login if email fails
        }

        res.status(200).json({
            success: true,
            token,
            user: {
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Google login route
router.post('/google', async (req, res) => {
    try {
        console.log('Google login attempt');
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google payload:', payload);

        // Find user by email
        let user = await User.findOne({ email: payload.email });
        
        if (!user) {
            console.log('User not found:', payload.email);
            return res.status(401).json({ 
                message: 'User not registered in the system. Please contact administrator.' 
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Google login successful:', user.email);

        // After successful login, before sending response
        try {
            await sendEmail({
                to: user.email,
                ...getLoginNotificationEmail(payload.name)
            });
            console.log('Login notification email sent to:', user.email);
        } catch (emailError) {
            console.error('Failed to send login notification:', emailError);
            // Don't block login if email fails
        }

        res.json({
            message: 'Login successful',
            token: jwtToken,
            user: {
                email: user.email,
                role: user.role,
                name: payload.name,
                picture: payload.picture
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: error.message 
        });
    }
});

module.exports = router;
