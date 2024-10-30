const express = require("express");
const router = express.Router();

// Authentication
router.post("/login", (req, res) => {
  res.send({ data: "Login successful" });
});
router.post("/signup", (req, res) => {
  res.send({ data: "Signup successful" });
});
router.post("/login/google", (req, res) => {
  res.send({ data: "Google login successful" });
});
router.post("/logout", (req, res) => {
  res.send({ data: "Logout successful" });
});
router.get("/session", (req, res) => {
  res.send({ data: "Session details" });
});
router.post("/verify-email", (req, res) => {
  res.send({ data: "Email verification successful" });
});
router.put("/update-profile", (req, res) => {
  res.send({ data: "Profile updated" });
});
router.post("/refresh-token", (req, res) => {
  res.send({ data: "Token refreshed" });
});

module.exports = router;
