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

// Add this route to mark a notification as read
router.put("/mark-read/:requestId", jwtVerifyMiddleware, async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      { isRead: true },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error marking request as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the return route
router.put('/:requestId/return', jwtVerifyMiddleware, async (req, res) => {
  try {
    console.log('Return request received for:', req.params.requestId);
    
    const request = await Request.findById(req.params.requestId)
      .populate('item')
      .populate('userId');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Request must be approved before it can be returned' 
      });
    }

    // Update request status
    request.status = 'returned';
    request.actualReturnDate = new Date();
    await request.save();

    // Update item availability
    const item = await Item.findById(request.item._id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.availability = true;
    await item.save();

    // Send email notification if configured
    try {
      await sendEmail({
        to: request.userId.email,
        ...getItemReturnedEmail(
          request.userId.name,
          request.item.name,
          new Date().toLocaleDateString()
        ),
      });
    } catch (emailError) {
      console.error('Failed to send return confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('Return processed successfully:', {
      request: request._id,
      item: item._id,
      availability: item.availability
    });

    res.json({
      message: 'Return processed successfully',
      request: request,
      item: item
    });

  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({
      message: 'Error processing return',
      error: error.message
    });
  }
});

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

module.exports = router;
