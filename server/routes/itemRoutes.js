const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findOne({ item_id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update item availability (protected route)
router.patch("/:id/availability", jwtVerifyMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ item_id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.availability = req.body.availability;
    item.status = req.body.availability ? "Available" : "Unavailable";

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
