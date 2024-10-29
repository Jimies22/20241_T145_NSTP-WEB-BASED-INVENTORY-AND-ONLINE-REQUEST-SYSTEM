const express = require("express");
const router = express.Router();

// Notifications
router.get("/notifications", adminController.viewNotifications);

module.exports = router;
