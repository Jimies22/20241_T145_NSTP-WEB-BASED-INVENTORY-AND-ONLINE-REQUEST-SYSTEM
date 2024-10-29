const express = require("express");
const router = express.Router();

// Inventory connected to controller
// router.get("/inventory/search", userController.searchInventory);
// router.get("/inventory/view", userController.viewInventory);
// router.get("/inventory/sort", userController.sortInventory);

// Inventory disconnected to controller
router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Inventory System" });
});

router.get("/status", (req, res) => {
  res.status(200).json({ message: "Inventory status retrieved successfully" });
});

router.get("/details", (req, res) => {
  res.status(200).json({ message: "Inventory details retrieved successfully" });
});

// Error handling middleware
router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
