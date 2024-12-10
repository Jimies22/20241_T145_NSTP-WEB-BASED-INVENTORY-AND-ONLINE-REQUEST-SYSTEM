const express = require("express");
const router = express.Router();
const itemService = require("../services/itemService");
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the absolute path
  },
  filename: function (req, file, cb) {
    // Add file extension handling
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

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
router.post("/additem", jwtVerifyMiddleware, upload.single('image'), async (req, res) => {
  try {
    const itemData = req.body;
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
      console.log('File uploaded successfully:', req.file.path);
    }

    // Let the service handle the ID generation
    const newItem = await itemService.createItem(itemData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error in additem route:', error);
    res.status(400).json({
      message: error.message,
      error: error.toString(),
      stack: error.stack
    });
  }
});

// Update item by item_id (protected route)
router.patch("/:item_id", jwtVerifyMiddleware, upload.single('image'), async (req, res) => {
  try {
    const itemData = req.body;
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
      console.log('File uploaded successfully:', req.file.path);
    }
    const updatedItem = await itemService.updateItem(req.params.item_id, itemData);
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error in patch route:', error);
    res.status(400).json({
      message: error.message,
      error: error.toString(),
      stack: error.stack
    });
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

// Add this debug route
router.get('/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.json({
      uploadDir,
      files,
      exists: fs.existsSync(uploadDir)
    });
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
      stack: error.stack
    });
  }
});

// Add this new route
router.get("/last-item-id", async (req, res) => {
  try {
    const lastItemId = await itemService.getLastItemId();
    res.json({ lastItemId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
