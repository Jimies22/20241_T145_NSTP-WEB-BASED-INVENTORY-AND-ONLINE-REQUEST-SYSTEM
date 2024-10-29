const express = require("express");
const router = express.Router();

// Define routes with unique paths
router.post("/bookings", (req, res) => {
  res.send({ data: "Booking placed successfully" });
});
router.delete("/bookings/cancel", (req, res) => {
  res.send({ data: "Booking cancelled successfully" });
});
router.get("/requests", (req, res) => {
  res.send({ data: "Requests retrieved successfully" });
});
router.get("/bookings/pending", (req, res) => {
  res.send({ data: "Pending bookings retrieved successfully" });
});
router.get("/bookings/accepted", (req, res) => {
  res.send({ data: "Accepted bookings retrieved successfully" });
});
router.get("/bookings/return", (req, res) => {
  res.send({ data: "Items to return retrieved successfully" });
});
router.post("/items/scanReturn", (req, res) => {
  res.send({ data: "Item return scanned successfully" });
});

module.exports = router;
