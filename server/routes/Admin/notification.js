const express = require("express");
const router = express.Router();

// Notifications
router.get("/", (req, res) => {
  res.send({ data: "Notifications" });
});

module.exports = router;
