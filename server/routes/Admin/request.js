const express = require("express");
const router = express.Router();

// Request Management
router.put("/request/:id/accept", (req, res) => {
  res.send({ message: "Request accepted successfully" });
});
router.put("/request/:id/decline", (req, res) => {
  res.send({ message: "Request declined successfully" });
});
router.get("/requests/pending", (req, res) => {
  res.send({ message: "List of pending requests" });
});
router.get("/requests/borrowed", (req, res) => {
  res.send({ message: "List of borrowed items" });
});

module.exports = router;
