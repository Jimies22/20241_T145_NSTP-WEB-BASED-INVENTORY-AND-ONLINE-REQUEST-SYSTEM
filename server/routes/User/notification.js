const express = require("express");
const router = express.Router();

// Notifications connected to controller
// router.get("/notifications", userController.viewNotifications);

// Notifications disconnected to controller
router.get("/", (req, res) => {
  const response = { data: "Welcome to the Notifications System" };
  res.status(200).json(response);
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = router;
