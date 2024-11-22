const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware"); // Assuming you have this middleware

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};

// Create a new borrow request (user only)
router.post("/", jwtVerifyMiddleware, borrowController.createRequest);

// Get all requests (admin only)
router.get(
  "/all",
  jwtVerifyMiddleware,
  isAdmin,
  borrowController.getAllRequests
);

// Get user's requests
router.get(
  "/my-requests",
  jwtVerifyMiddleware,
  borrowController.getUserRequests
);

// Update request status (admin only)
router.patch(
  "/:requestId/status",
  jwtVerifyMiddleware,
  isAdmin,
  borrowController.updateRequestStatus
);

// Delete a request
router.delete(
  "/:requestId",
  jwtVerifyMiddleware,
  borrowController.deleteRequest
);

module.exports = router;
