import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  archiveItem,
  restoreItem,
} from "../../controllers/itemController.js";
import {
  logRequest,
  validateItemFields,
  validateObjectId,
  logDetailedRequest,
} from "../../middleware/itemMiddleware.js";

const router = express.Router();

// Applying logging middleware to all routes
router.use(logRequest);

// Routes with specific middleware
router.post("/", [logDetailedRequest, validateItemFields], createItem);
router.get("/", getAllItems);
router.get("/:id", validateObjectId, getItemById);
router.put("/:id", [validateObjectId, validateItemFields], updateItem);
router.patch("/:id/archive", validateObjectId, archiveItem);
router.patch("/:id/restore", validateObjectId, restoreItem);

export default router;
