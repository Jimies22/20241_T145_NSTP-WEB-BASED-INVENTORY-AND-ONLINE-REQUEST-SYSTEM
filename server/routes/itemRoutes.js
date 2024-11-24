const express = require("express");
const router = express.Router();
const itemService = require("../services/itemService");
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");

// Get all items
router.get("/", async (req, res) => {
  try {
    const items = await itemService.getAllItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get item by item_id
router.get("/:item_id", async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.item_id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new item (protected route)
router.post("/additem", jwtVerifyMiddleware, async (req, res) => {
  try {
    const newItem = await itemService.createItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item by item_id (protected route)
router.patch("/:item_id", jwtVerifyMiddleware, async (req, res) => {
  try {
    const updatedItem = await itemService.updateItem(
      req.params.item_id,
      req.body
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item by item_id (protected route)
router.delete("/:item_id", jwtVerifyMiddleware, async (req, res) => {
  try {
    const deletedItem = await itemService.deleteItem(req.params.item_id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to handle borrow requests
router.post("/borrow", jwtVerifyMiddleware, borrowController.createRequest);

module.exports = router;
