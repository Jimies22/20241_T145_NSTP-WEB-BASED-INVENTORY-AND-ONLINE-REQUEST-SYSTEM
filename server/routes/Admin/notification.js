const express = require("express");
const router = express.Router();

// Notifications
router.get("/api/admin/notifications", (req, res) => {
  res.send({ data: "Notifications" });
});

module.exports = router;
