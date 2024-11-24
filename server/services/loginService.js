// services/loginService.js

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} does not exist. No role assigned.`);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate JWT token for Google login
    const sessionToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // User exists, log their role
    console.log(
      `User ${email} logged in. Role: ${user.role}. JWT Token: ${sessionToken}`
    );

    res.json({
      message: "Login successful",
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: user.role,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Attempting admin login for:", email); // Debug log

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("Admin not found with email:", email);
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Verify password using bcrypt
    const isValidPassword = await admin.comparePassword(password);

    if (!isValidPassword) {
      console.log("Invalid password for admin:", email);
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    console.log("Admin login successful:", email);
    console.log("Admin token:", token);
    // Send success response
    res.status(200).json({
      message: "Login successful",
      user: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "An error occurred during login",
    });
  }
};

module.exports = { loginUser, loginAdmin };
