const User = require("../models/User");
const { sendEmail, getNewUserWelcomeEmail } = require("./emailService");

// Create a new user
const createUser = async (req, res) => {
  const { email, role, name, department, password } = req.body;

  try {
    // Extract userID from email for student emails
    let userID;
    if (email.includes("@student.buksu.edu.ph")) {
      userID = parseInt(email.split("@")[0]);
    } else {
      // For non-student emails, generate a random 10-digit number
      userID = Math.floor(Math.random() * 9000000000) + 1000000000;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { userID }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      role,
      name,
      department,
      userID,
      password,
    });

    await newUser.save();
    
    // Send welcome email to the newly registered user
    try {
      const emailContent = getNewUserWelcomeEmail(name, email, password);
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        text: emailContent.text
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue with registration even if email fails
    }
    
    res
      .status(201)
      .json({ 
        message: "User registered successfully", 
        user: newUser,
        emailSent: true 
      });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a user by userID
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by userID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search users by name
const searchUsersByName = async (req, res) => {
  try {
    const users = await User.find({ name: new RegExp(req.params.name, "i") });
    res.json(users);
  } catch (error) {
    console.error("Error searching users by name:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user information
const updateUser = async (req, res) => {
  const { name, role, department, email } = req.body;
  const { userID } = req.params;

  try {
    // Check if email is being changed and already exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        userID: { $ne: parseInt(userID) },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const user = await User.findOneAndUpdate(
      { userID: parseInt(userID) },
      {
        $set: {
          name: name || undefined,
          role: role || undefined,
          email: email || undefined,
          department: department || undefined,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user by userID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ userID: req.params.userID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Archive a user
const archiveUser = async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { userID: parseInt(userID) },
      { isArchived: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User archived successfully", user });
  } catch (error) {
    console.error("Error archiving user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unarchive a user
const unarchiveUser = async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { userID: parseInt(userID) },
      { isArchived: false }, // Set isArchived to false
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User unarchived successfully", user });
  } catch (error) {
    console.error("Error unarchiving user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  searchUsersByName,
  updateUser,
  deleteUser,
  archiveUser,
  unarchiveUser,
};
