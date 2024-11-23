const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");

// Apply JWT verification to all routes
router.use(jwtVerifyMiddleware);

// Create borrow request
router.post("/", borrowController.createRequest);

// Get all requests (admin only)
router.get("/all", borrowController.getAllRequests);

// Get user's requests
router.get("/user", borrowController.getUserRequests);

// Update request status
router.patch("/:requestId/status", borrowController.updateRequestStatus);

// Delete request
router.delete("/:requestId", borrowController.deleteRequest);

module.exports = router;
