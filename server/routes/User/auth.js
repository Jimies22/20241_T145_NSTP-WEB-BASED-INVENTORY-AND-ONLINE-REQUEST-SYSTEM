const express = require("express");
const router = express.Router();

// Authentication connected to the controller
// router.post("/login", userController.login);
// router.post("/signup", userController.signup);
// router.post("/login/google", userController.googleLogin);
// router.post("/logout", userController.logout);
// router.get("/session", userController.checkSession);
// router.post("/verify-email", userController.verifyEmail);
// router.put("/update-profile", userController.updateProfile);
// router.post("/refresh-token", userController.refreshToken);

// Authentication disconnected to the controller
router.post("/login", (req, res) => {
  res.send({ data: "User logged in successfully" });
  console.log("Login request received");
});

router.post("/signup", (req, res) => {
  res.send({ data: "User signed up successfully" });
});

router.post("/login/google", (req, res) => {
  res.send({ data: "User logged in with Google successfully" });
});

router.post("/logout", (req, res) => {
  res.send({ data: "User logged out successfully" });
});

router.get("/session", (req, res) => {
  res.send({ data: "Session data retrieved successfully" });
});

router.post("/verify-email", (req, res) => {
  res.send({ data: "Email verified successfully" });
});

router.put("/update-profile", (req, res) => {
  res.send({ data: "Profile updated successfully" });
});

router.post("/refresh-token", (req, res) => {
  res.send({ data: "Token refreshed successfully" });
});

module.exports = router;
