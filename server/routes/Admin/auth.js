const express = require("express");
const router = express.Router();

// Authentication
router.post("/", (req, res) => {
  res.send({ data: "Login successful" });
});
router.post("/", (req, res) => {
  res.send({ data: "Signup successful" });
});
router.post("/", (req, res) => {
  res.send({ data: "Google login successful" });
});
router.post("/", (req, res) => {
  res.send({ data: "Logout successful" });
});
router.get("/", (req, res) => {
  res.send({ data: "Session details" });
});
router.post("/", (req, res) => {
  res.send({ data: "Email verification successful" });
});
router.put("/", (req, res) => {
  res.send({ data: "Profile updated" });
});
router.post("/", (req, res) => {
  res.send({ data: "Token refreshed" });
});

module.exports = router;
