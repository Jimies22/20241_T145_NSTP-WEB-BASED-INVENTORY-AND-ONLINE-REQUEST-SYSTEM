const express = require("express");
const router = express.Router();

// Dashboard

router.get("/", (req, res) => {
  res.send({ data: "Welcome to the User Dashboard" });
});

// User profile
router.get("/profile", (req, res) => {
  res.send({ data: "userProfile" });
});

// Borrowed items
router.get("/borrowed-items", (req, res) => {
  res.send({ data: "borrowedItems" });
});

module.exports = router;
