const express = require("express");
const router = express.Router();

// Request Management
router.put("/api/admin/req-accepted", (req, res) => {
  res.send({ message: "Request accepted successfully" });
});
router.put("/api/admin/req-declined", (req, res) => {
  res.send({ message: "Request declined successfully" });
});
router.get("/api/admin/req-list", (req, res) => {
  res.send({ message: "List of pending requests" });
});
router.get("/api/admin/borrow-req", (req, res) => {
  res.send({ message: "List of borrowed items" });
});

module.exports = router;
