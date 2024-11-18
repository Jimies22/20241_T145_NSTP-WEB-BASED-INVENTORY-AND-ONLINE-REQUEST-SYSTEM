import express from "express";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/erval2Middleware.js";

const router = express.Router();

// Test protected route
router.get("/test", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// Admin only route
router.get("/admin", authenticateToken, authorizeAdmin, (req, res) => {
  res.json({
    message: "Admin route accessed successfully",
    user: req.user,
  });
});

export default router;
