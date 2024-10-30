const express = require("express");
const router = express.Router();

// Request Management
router.put("/", (req, res) => {
  res.send({ message: "Request accepted successfully" });
});
router.put("/", (req, res) => {
  res.send({ message: "Request declined successfully" });
});
router.get("/", (req, res) => {
  res.send({ message: "List of pending requests" });
});
router.get("/", (req, res) => {
  res.send({ message: "List of borrowed items" });
});

module.exports = router;
