// services/loginService.js

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginService = {
  // Google login for regular users only
  loginUser: async (req, res) => {
    try {
      const { token } = req.body;

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email, name } = ticket.getPayload();

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user with 'user' role
        user = await User.create({
          email,
          name,
          role: "user", // Enforce user role for Google login
          googleId: ticket.getUserId(),
        });
      } else if (user.role === "admin") {
        // Prevent admins from using Google login
        return res.status(403).json({
          message: "Administrators must use the admin login form",
        });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token: jwtToken,
        user: {
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(401).json({
        message: "Authentication failed",
      });
    }
  },

  // Regular login for administrators only
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email and verify they are an admin
      const user = await User.findOne({ email, role: "admin" });

      if (!user) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Verify password using bcrypt
      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Generate JWT token for admin
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Send success response - Changed to match client expectation
      res.status(200).json({
        message: "Login successful", // Changed from "Admin login successful"
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // Make sure token is included
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        message: "An error occurred during admin login",
      });
    }
  },
};

module.exports = loginService;
