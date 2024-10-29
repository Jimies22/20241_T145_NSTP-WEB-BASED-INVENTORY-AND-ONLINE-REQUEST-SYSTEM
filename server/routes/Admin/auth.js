const express = require("express");
const router = express.Router();

// Authentication Routes
router.post("/login", adminController.login);
router.post("/signup", adminController.signup);
router.post("/login/google", adminController.googleLogin);
router.post("/logout", adminController.logout);
router.get("/session", adminController.checkSession);
router.post("/verify-email", adminController.verifyEmail);
router.put("/update-profile", adminController.updateProfile);
router.post("/refresh-token", adminController.refreshToken);

// Error Handling
router.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

router.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ error: { message: error.message } });
});

module.exports = router;
router.route("/logout").post(adminController.logout);

router.route("/session").get(adminController.checkSession);

router.route("/verify-email").post(adminController.verifyEmail);

router.route("/update-profile").put(adminController.updateProfile);

router.route("/refresh-token").post(adminController.refreshToken);

module.exports = router;
