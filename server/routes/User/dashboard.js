const express = require("express");
const router = express.Router();

// Dashboard and Profile connected to the controller
// router.get("/dashboard", userController.getDashboard);
// router.get("/profile", userController.getProfile);

// Dashboard and Profile disconnected to the controller
router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the User Dashboard" });
});

router.get("/profile", authenticate, (req, res) => {
  res
    .status(200)
    .json({ message: "User profile retrieved successfully", data: req.user });
});

function authenticate(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = router;

module.exports = router;
