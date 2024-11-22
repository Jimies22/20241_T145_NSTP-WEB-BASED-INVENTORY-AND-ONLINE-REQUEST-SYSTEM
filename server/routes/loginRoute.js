import express from "express";
import {
  googleLogin,
  verifyRecaptcha,
  login,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/verify-recaptcha", verifyRecaptcha);
router.post("/google", googleLogin);
router.post("/login", login);

export default router;
