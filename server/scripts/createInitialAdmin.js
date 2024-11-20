require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

async function createInitialAdmin() {
  try {
    await connectDB();

    const adminData = {
      name: "Admin",
      email: "admin@buksu.edu.ph",
      password: "admin123!@#", // Make sure to change this in production
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminData.email,
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log("Admin created successfully:");
    console.log({
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}
createInitialAdmin();
