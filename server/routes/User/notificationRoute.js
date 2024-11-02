const express = require("express");
const router = express.Router();

// Notifications connected to controller
// router.get("/notifications", userController.viewNotifications);

// Notifications disconnected to controller
router.get("/api/user/notifications", (req, res) => {
  res.send({ data: "Welcome to the Notifications System" });
});
module.exports = router;
