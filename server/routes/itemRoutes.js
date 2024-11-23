const express = require("express");
const router = express.Router();
const itemService = require('../services/itemService');
const Item = require('../models/Item');

// Get all items
router.get('/', async (req, res) => {
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
});

// Update item by item_id
router.patch('/:item_id', async (req, res) => {
    try {
        const updatedItem = await Item.findOneAndUpdate(
            { item_id: req.params.item_id },
            { $set: req.body },
            { new: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(400).json({ message: error.message });
    }
});

// Create new item
router.post("/additem", jwtVerifyMiddleware, async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
