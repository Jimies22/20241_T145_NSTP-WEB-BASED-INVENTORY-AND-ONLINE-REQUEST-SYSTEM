// authController.js
import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Function to create initial admin if none exists
export const createInitialAdmin = async () => {
  try {
    // Check if any admin exists
    const adminExists = await Admin.findOne();

    if (!adminExists) {
      const initialAdmin = new Admin({
        email: "admin@example.com",
        password: "admin123", // This will be hashed automatically by the pre-save hook
      });

      await initialAdmin.save();
      console.log("Initial admin account created successfully");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
};

// Admin login controller
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Optional: Add admin verification middleware
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Add this new export
export const checkAdminExists = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    return res.status(200).json({
      success: true,
      exists: !!admin,
    });
  } catch (error) {
    console.error("Error checking admin existence:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
