require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

async function createInitialAdmin() {
  try {
    await connectDB();

    const adminData = {
      name: "Admin",
      email: "admin@buksu.edu.ph", // Change this to your desired admin email
      password: "admin123!@#", // Change this to a secure password
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin(adminData);
    await admin.save();

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createInitialAdmin();
