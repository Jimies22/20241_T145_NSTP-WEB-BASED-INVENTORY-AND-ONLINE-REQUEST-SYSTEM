const express = require("express");
const router = express.Router();

// Dashboard

router.get("/", (req, res) => {
  res.send("Welcome to the Admin Dashboard");
});

// User profile
router.get("/admin-profile", (req, res) => {
  res.send({ data: "userProfile" });
});

module.exports = router;
