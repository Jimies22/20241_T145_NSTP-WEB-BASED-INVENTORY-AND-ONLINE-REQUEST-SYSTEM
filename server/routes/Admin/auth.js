const express = require("express");
const router = express.Router();

// Authentication
router.post("/login", adminController.login);
router.post("/signup", adminController.signup);
router.post("/login/google", adminController.googleLogin);
router.post("/logout", adminController.logout);
router.get("/session", adminController.checkSession);
router.post("/verify-email", adminController.verifyEmail);
router.put("/update-profile", adminController.updateProfile);
router.post("/refresh-token", adminController.refreshToken);

module.exports = router;
