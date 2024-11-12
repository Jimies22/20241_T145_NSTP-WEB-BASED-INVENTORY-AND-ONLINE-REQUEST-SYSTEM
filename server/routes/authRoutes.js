import express from "express";
import {
  adminLogin,
  checkAdminExists,
} from "../controllers/adminLoginController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/check", checkAdminExists);

export default router;
