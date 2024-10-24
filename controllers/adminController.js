// adminController.js

const Admin = require("../models/Admin"); // Assuming you have an Admin model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // For token generation

// Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a token (optional)
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      "your_jwt_secret",
      {
        expiresIn: "1h", // Token expiration time
      }
    );

    res.status(200).json({
      message: "Login successful",
      token, // Send token to client
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email, // Include other admin details as needed
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};
