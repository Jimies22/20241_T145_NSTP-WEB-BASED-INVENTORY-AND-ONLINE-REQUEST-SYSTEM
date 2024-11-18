import express from "express";
import userController from "../../controllers/userController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";
import {
  validateUser,
  validateUserID,
  errorHandler,
  notFound,
} from "../../middleware/ervalMiddleware.js";

const router = express.Router();

// Public routes
router.post("/create", validateUser, userController.createUser);
router.get("/search/:name", userController.searchUsersByName);

// Protected routes (require authentication)
router.get("/all", protect, userController.getAllUsers);
router.get("/:userID", protect, validateUserID, userController.getUserById);

// Admin only routes
router.put(
  "/update/:userID",
  protect,
  admin,
  validateUserID,
  validateUser,
  userController.updateUser
);
router.delete(
  "/delete/:userID",
  protect,
  admin,
  validateUserID,
  userController.deleteUser
);

export default router;
