const express = require("express");
const router = express.Router();

// Inventory connected to controller
// router.get("/inventory/search", userController.searchInventory);
// router.get("/inventory/view", userController.viewInventory);
// router.get("/inventory/sort", userController.sortInventory);

// Inventory disconnected to controller
router.get("/", (req, res) => {
  res.send({ data: "Welcome to the Inventory System" });
});
router.get("/status", (req, res) => {
  res.send({ data: "Inventory status retrieved successfully" });
});
router.get("/details", (req, res) => {
  res.send({ data: "Inventory details retrieved successfully" });
});

module.exports = router;
