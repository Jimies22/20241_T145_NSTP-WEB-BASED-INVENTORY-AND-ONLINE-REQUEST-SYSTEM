import express from "express";
import { updateAdminPassword } from "../../controllers/loginController.js";
import { auth } from "../../middleware/auth.js";

const router = express.Router();

// Route to update admin password
router.put("/update-password", auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const adminId = req.user.id; // Gets admin ID from auth middleware

    const success = await updateAdminPassword(adminId, newPassword);

    if (success) {
      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update password",
      });
    }
  } catch (error) {
    console.error("Password update route error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
