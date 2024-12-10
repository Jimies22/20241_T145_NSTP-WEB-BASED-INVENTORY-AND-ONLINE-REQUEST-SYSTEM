const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const { jwtVerifyMiddleware } = require("../middleware/authMiddleware"); // Ensure this path is correct
const {
  sendEmail,
  getBorrowSuccessEmail,
  getBorrowCancelledEmail,
  getItemReturnedEmail,
  getReturnOverdueEmail,
} = require("../services/emailService");

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
  async (req, res) => {
    console.log('Received status update request:', {
      requestId: req.params.requestId,
      status: req.body.status
    });
    borrowController.updateRequestStatus(req, res);
  }
);

// Delete a request
router.delete(
  "/:requestId",
  jwtVerifyMiddleware,
  borrowController.deleteRequest
);

// user route for cancelling requests
router.put(
  "/my-requests/:requestId/status/cancel",
  jwtVerifyMiddleware,
  borrowController.cancelRequest
);

// Example usage in your borrow success route
router.post("/borrow-success", async (req, res) => {
  try {
    const { userName, userEmail, itemName, dueDate } = req.body;

    // Send email notification
    await sendEmail({
      to: userEmail,
      ...getBorrowSuccessEmail(userName, itemName, dueDate),
    });

    res.json({ message: "Borrow success notification sent" });
  } catch (error) {
    console.error("Error sending borrow success notification:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

// Example usage in your return route
router.post("/return-item", async (req, res) => {
  try {
    const { userName, userEmail, itemName } = req.body;

    // Send email notification
    await sendEmail({
      to: userEmail,
      ...getItemReturnedEmail(userName, itemName, new Date()),
    });

    res.json({ message: "Return notification sent" });
  } catch (error) {
    console.error("Error sending return notification:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

module.exports = router;
