// inventory
import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware.js";
const router = Router();

// import controller functions
import {
  getItems,
  getItem,
  postItem,
  putItem,
  patchItem,
  deleteItem,
} from "../../controllers/itemController.js";

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get item list
router.get("/", getItems);

// get item by ID
router.get("/:item_id", getItem);

// Create a new item
router.post("/", postItem);

// Update an item by ID
router.put("/:item_id", putItem);

// Patch an item by ID
router.patch("/:itemId", patchItem);

// Delete an item by ID
router.delete("/:item_id", deleteItem);

export default router;
