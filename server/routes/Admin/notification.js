const express = require("express");
const router = express.Router();

// Notifications
router.get("/notifications", async (req, res, next) => {
  try {
    const notifications = await adminController.viewNotifications(req);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
