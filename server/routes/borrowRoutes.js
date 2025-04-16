const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const Item = require("../models/Item");
const Request = require("../models/borrow");
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

// Update the route to mark a notification as read
router.put("/mark-read/:requestId", jwtVerifyMiddleware, async (req, res) => {
  try {
    console.log(`Marking request ${req.params.requestId} as read`);
    
    // Update the request and ensure it returns populated data
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      { isRead: true },
      { new: true }
    )
    .populate('item')
    .populate('userId');

    if (!request) {
      console.log(`Request not found: ${req.params.requestId}`);
      return res.status(404).json({ message: "Request not found" });
    }

    console.log(`Request marked as read: ${request._id}, isRead: ${request.isRead}`);

    // Get the total count of unread requests for this user
    const unreadCount = await Request.countDocuments({
      userId: req.user.userId,
      status: { $in: ['pending', 'rejected'] },
      isRead: { $ne: true }
    });

    res.json({
      request,
      unreadCount,
      message: "Request marked as read successfully"
    });
  } catch (error) {
    console.error("Error marking request as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the return route
router.put('/:requestId/return', jwtVerifyMiddleware, isAdmin, borrowController.processReturn);

// Get user's returned items
router.get('/user/:userId', jwtVerifyMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching returned items for user:', userId);

    const requests = await Request.find({ 
      userId: userId,
      status: 'returned'
    })
    .populate('item')
    .sort({ updatedAt: -1 });

    console.log('Found returned items:', requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching user returned items:', error);
    res.status(500).json({
      message: 'Error fetching returned items',
      error: error.message
    });
  }
});

// Fetch only returned items for a specific user
router.get('/user/:userId/returned', jwtVerifyMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const returnedItems = await Request.find({ userId, status: 'returned' }).populate('item');
    res.json(returnedItems);
  } catch (error) {
    console.error('Error fetching returned items:', error);
    res.status(500).json({ message: 'Failed to fetch returned items', error: error.message });
  }
});

// Add this new route
router.get("/approved", jwtVerifyMiddleware, borrowController.getUserApprovedRequests);

// Add a return notification endpoint
router.post('/return-notification', jwtVerifyMiddleware, async (req, res) => {
  try {
    const { userName, userEmail, itemName, borrowDate, returnDate } = req.body;

    // Validate required fields
    if (!userName || !userEmail || !itemName || !borrowDate || !returnDate) {
      return res.status(400).json({ 
        message: 'Missing required fields for return notification'
      });
    }

    // Send the return confirmation email
    await sendEmail({
      to: userEmail,
      ...getItemReturnedEmail(userName, itemName, borrowDate, returnDate)
    });

    res.json({ message: 'Return notification sent successfully' });
  } catch (error) {
    console.error('Error sending return notification:', error);
    res.status(500).json({ 
      message: 'Failed to send return notification',
      error: error.message 
    });
  }
});

module.exports = router;
