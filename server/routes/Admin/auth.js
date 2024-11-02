const express = require("express");
const router = express.Router();

// Authentication
router.post("/api/admin/login", (req, res) => {
  res.send({ data: "Login successful" });
});
router.post("/api/admin/signup", (req, res) => {
  res.send({ data: "Signup successful" });
});
router.post("/api/admin/login/google", (req, res) => {
  res.send({ data: "Google login successful" });
});
router.post("/api/admin/logout", (req, res) => {
  res.send({ data: "Logout successful" });
});
router.get("/api/admin/session", (req, res) => {
  res.send({ data: "Session details" });
});
router.post("/api/admin/email", (req, res) => {
  res.send({ data: "Email verification successful" });
});
router.put("/api/admin/profile", (req, res) => {
  res.send({ data: "Profile updated" });
});
router.post("/api/admin/token-serve", (req, res) => {
  res.send({ data: "Token refreshed" });
});

module.exports = router;
