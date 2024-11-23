const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware");

// Create a new borrow request
router.post("/create", jwtVerifyMiddleware, borrowController.createRequest);

// Get all requests (admin only)
router.get("/all", jwtVerifyMiddleware, borrowController.getAllRequests);

// Get user's requests
router.get(
  "/my-requests",
  jwtVerifyMiddleware,
  borrowController.getUserRequests
);

// Update request status
router.patch(
  "/:requestId/status",
  jwtVerifyMiddleware,
  borrowController.updateRequestStatus
);

// Delete a request
router.delete(
  "/:requestId",
  jwtVerifyMiddleware,
  borrowController.deleteRequest
);

module.exports = router;
