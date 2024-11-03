// notification
const express = require("express");
const router = express.Router();

// Notifications
router.get("/notification", (req, res) => {
  res.send({ data: "Notifications" });
});

module.exports = router;
