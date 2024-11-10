// authController.js
import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // for bcrypt

// Helper function to hash password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Password hashing error:", error);
    throw new Error("Password hashing failed");
  }
};

// Function to create initial admin (use this once to set up admin)
const createInitialAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword("admin123"); // Change this password

    // Create new admin
    const newAdmin = new Admin({
      email: "admin@example.com", // Change this email
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("Initial admin created successfully");
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
};

// Admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email (case-insensitive)
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Function to update admin password
const updateAdminPassword = async (adminId, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    await Admin.findByIdAndUpdate(adminId, { password: hashedPassword });
    return true;
  } catch (error) {
    console.error("Password update error:", error);
    return false;
  }
};

export { adminLogin, createInitialAdmin, updateAdminPassword };
