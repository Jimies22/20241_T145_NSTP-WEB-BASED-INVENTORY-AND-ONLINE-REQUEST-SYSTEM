const express = require("express");
const router = express.Router();

// // Bookings and Requests connected to controller
// router.post("/bookings", userController.placeBooking);
// router.delete("/bookings/cancel", userController.cancelBooking);
// router.get("/requests", userController.viewRequests);
// router.get("/bookings/pending", userController.viewPendingBookings);
// router.get("/bookings/accepted", userController.viewAcceptedBookings);
// router.get("/bookings/return", userController.viewItemsToReturn);
// router.post("/items/scanReturn", userController.scanItemReturn);

// Bookings and Requests disconnected to controller
router.post("/", (req, res) => {
  res.send({ data: "Booking placed successfully" });
});
router.delete("/", (req, res) => {
  res.send({ data: "Booking cancelled successfully" });
});
router.get("/", (req, res) => {
  res.send({ data: "Requests retrieved successfully" });
});
router.get("/", (req, res) => {
  res.send({ data: "Pending bookings retrieved successfully" });
});
router.get("/", (req, res) => {
  res.send({ data: "Accepted bookings retrieved successfully" });
});
router.get("/", (req, res) => {
  res.send({ data: "Items to return retrieved successfully" });
});
router.post("/", (req, res) => {
  res.send({ data: "Item return scanned successfully" });
});
// router.post("/api/user/items/scanReturn", (req, res) => {
//   res.send({ data: "Item scanned, return confirmed" });
// });

module.exports = router;
