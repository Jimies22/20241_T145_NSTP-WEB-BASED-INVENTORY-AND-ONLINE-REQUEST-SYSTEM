import express from "express";
import { googleLogin, verifyRecaptcha } from "../controllers/authController.js";

const router = express.Router();

router.post("/verify-recaptcha", verifyRecaptcha);
router.post("/google", googleLogin);

export default router;
