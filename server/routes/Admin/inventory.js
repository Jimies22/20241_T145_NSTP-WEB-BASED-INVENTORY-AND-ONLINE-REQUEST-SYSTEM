// inventory
import { Router } from "express";
const router = Router();

// import controller functions
import {
  getItems,
  getItem,
  postItem,
  putItem,
  deleteItem,
} from "../../controllers/itemController.js";

// Get item list
router.get("/", getItems);

// get item by ID
router.get("/:item_id", getItem);

// Create a new item
router.post("/", postItem);

// Update an item by ID
router.put("/:item_id", putItem);

// Delete an item by ID
router.delete("/:item_id", deleteItem);

export default router;
