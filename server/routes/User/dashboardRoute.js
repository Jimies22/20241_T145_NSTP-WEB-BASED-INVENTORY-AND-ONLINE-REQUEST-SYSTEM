const express = require("express");
const router = express.Router();

// Dashboard and Profile connected to the controller
// router.get("/dashboard", userController.getDashboard);
// router.get("/profile", userController.getProfile);

// Dashboard and Profile disconnected to the controller
router.get("/api/user/dashboard", (req, res) => {
  res.send({ data: "Welcome to the User Dashboard" });
});
router.get("/api/user/profile", (req, res) => {
  res.send({ data: "User profile retrieved successfully" });
});
module.exports = router;
