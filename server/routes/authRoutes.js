import express from "express";
import { adminLogin } from "../controllers/loginController.js";
import { handleGoogleLogin, logout } from "../controllers/authController.js";

const router = express.Router();

// Admin login route
router.post("/admin/login", adminLogin);

// Google login route
router.post("/google-login", handleGoogleLogin);

// Logout route
router.post("/logout", logout);

export default router;
