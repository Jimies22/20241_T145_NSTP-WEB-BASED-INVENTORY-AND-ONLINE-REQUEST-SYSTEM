const express = require("express");
const router = express.Router();

// Notifications disconnected to controller
router.get("/", (req, res) => {
  res.send({ data: "Welcome to the Notifications System" });
});
module.exports = router;

// const express = require("express");
// const router = express.Router();

// // Notifications for the user
// router.get("/", (req, res) => {
//   // Logic to fetch notifications for the user
//   res.send({ data: "Welcome to the Notifications System" });
// });

// // Notify user of booking approval
// router.post("/approve", (req, res) => {
//   const { bookingId } = req.body; // Assuming booking ID is passed in the body
//   // Logic to approve the booking
//   res.send({
//     data: `Booking ${bookingId} approved. Notification sent to user.`,
//   });
// });

// module.exports = router;
