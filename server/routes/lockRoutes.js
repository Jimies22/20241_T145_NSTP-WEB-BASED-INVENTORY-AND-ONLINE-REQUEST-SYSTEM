const express = require("express");
const router = express.Router();
const lockService = require("../services/lockService");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");

// Get lock status
router.get("/:button", async (req, res) => {
    try {
        const lock = await lockService.getLockStatus(req.params.button);
        res.json(lock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update lock status
router.patch("/:button", jwtVerifyMiddleware, async (req, res) => {
    try {
        const lock = await lockService.updateLockStatus(
            req.params.button,
            req.body.isLocked
        );
        res.json(lock);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;