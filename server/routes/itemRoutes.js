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

router.patch("/:item_id/archive", jwtVerifyMiddleware, async (req, res) => {
  try {
    const updatedItem = await itemService.archiveItem(
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

// Add new restore route
router.patch("/:item_id/restore", jwtVerifyMiddleware, async (req, res) => {
  try {
    const itemId = req.params.item_id;

    // Add validation for itemId
    if (!itemId) {
      console.error("No item ID provided");
      return res.status(400).json({ message: "Item ID is required" });
    }

    console.log("Attempting to restore item with ID:", itemId);

    // Check if item exists first
    const item = await itemService.getItemById(itemId);
    if (!item) {
      console.log("Item not found with ID:", itemId);
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = await itemService.updateItem(itemId, {
      isArchived: false,
      status: "Available",
    });

    console.log("Item restored successfully:", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error in restore route:", error);
    res.status(400).json({
      message: "Error restoring item",
      error: error.message,
    });
  }
});

// Route to handle borrow requests
router.post("/borrow", jwtVerifyMiddleware, borrowController.createRequest);

module.exports = router;
