const Request = require("../models/borrow");
const User = require("../models/User");
const Item = require("../models/Item");
const activityService = require("../services/activityService");

const borrowController = {
  // Create a new borrow request
  createRequest: async (req, res) => {
    try {
      const { item, borrowDate, returnDate, requestDate } = req.body;
      const userId = req.user.userId;

      console.log("Incoming request body:", req.body);

      // Validate if userId exists in the database
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ message: `User not found: ${userId}` });
      }

      // Validate if item exists in the database
      const itemExists = await Item.findById(item);
      if (!itemExists) {
        return res.status(404).json({ message: `Item not found: ${item}` });
      }

      // Convert dates to Date objects
      const borrowDateObj = new Date(borrowDate);
      const returnDateObj = new Date(returnDate);
      const requestDateObj = new Date(requestDate);

      /* Comment out date validation
      // Validate that borrowDate and returnDate are on the same day
      if (borrowDateObj.toDateString() !== returnDateObj.toDateString()) {
        return res.status(400).json({
          message: "Borrow and return dates must be on the same day.",
        });
      }

      // Validate that returnDate is after borrowDate
      if (returnDateObj <= borrowDateObj) {
        return res
          .status(400)
          .json({ message: "Return date must be after borrow date." });
      }
      */

      // Save the request in the database
      const newRequest = new Request({
        userId,
        item,
        borrowDate: borrowDateObj,
        returnDate: returnDateObj,
        requestDate: requestDateObj,
        status: "pending",
      });

      const savedRequest = await newRequest.save();
      console.log("Saved Request:", savedRequest);
      res.status(201).json(savedRequest);
    } catch (error) {
      console.error("Error creating request:", error);
      res
        .status(500)
        .json({ message: "Error creating request", error: error.message });
    }
  },

  // Get all requests (for admin)
  getAllRequests: async (req, res) => {
    try {
      const requests = await Request.find()
        .populate("userId", "name email")
        .populate("item"); // Populate item details
      res.status(200).json(requests);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching requests", error: error.message });
    }
  },

  // Get user's requests
  getUserRequests: async (req, res) => {
    try {
      const userId = req.user.userId;
      const requests = await Request.find({ userId })
        .populate('item')
        .lean(); // Add lean() for better performance
      
      console.log('Fetched requests:', requests); // Debug log
      res.status(200).json(requests);
    } catch (error) {
      console.error('Error in getUserRequests:', error);
      res.status(500).json({
        message: "Error fetching user requests",
        error: error.message,
      });
    }
  },

  // Get user's approved requests
  getUserApprovedRequests: async (req, res) => {
    try {
      const userId = req.user.userId;
      const approvedRequests = await Request.find({ 
        userId: userId,
        status: "approved"
      })
      .populate('item')
      .populate('userId', 'name email')
      .lean();
      
      console.log('Fetched approved requests:', approvedRequests); // Debug log
      res.status(200).json(approvedRequests);
    } catch (error) {
      console.error('Error in getUserApprovedRequests:', error);
      res.status(500).json({
        message: "Error fetching approved requests",
        error: error.message,
      });
    }
  },

  // Update request status (for admin)
  updateRequestStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      console.log('Attempting to update request:', {
        requestId,
        newStatus: status
      });

      // First find the request and populate item details
      const request = await Request.findById(requestId).populate('item');
      if (!request) {
        console.log('No request found with ID:', requestId);
        return res.status(404).json({ message: "Request not found" });
      }

      // Check if item exists
      const item = await Item.findById(request.item._id);
      if (!item) {
        console.log('No item found with ID:', request.item._id);
        return res.status(404).json({ message: "Item not found" });
      }

      // If approving, check if item is available
      if (status === "approved" && !item.availability) {
        return res.status(400).json({ 
          message: "Item is currently unavailable" 
        });
      }

      // Update the request status
      const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        { status: status },
        {
          new: true,
          runValidators: true
        }
      ).populate('item').populate('userId');

      if (!updatedRequest) {
        console.log('Failed to update request');
        return res.status(500).json({ message: "Failed to update request" });
      }

      // Update item availability based on status
      if (status === "approved") {
        await Item.findByIdAndUpdate(
          request.item._id,
          { availability: false },
          { new: true }
        );
        console.log(`Item ${request.item._id} marked as unavailable`);
      } else if (status === "rejected" || status === "returned") {
        await Item.findByIdAndUpdate(
          request.item._id,
          { availability: true },
          { new: true }
        );
        console.log(`Item ${request.item._id} marked as available`);
      }

      console.log('Successfully updated request:', updatedRequest);
      res.status(200).json(updatedRequest);

    } catch (error) {
      console.error("Error in updateRequestStatus:", error);
      res.status(500).json({
        message: "Error updating request status",
        error: error.message
      });
    }
  },

  // Delete a request
  deleteRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const deletedRequest = await Request.findByIdAndDelete(requestId);

      if (!deletedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting request", error: error.message });
    }
  },

  // Cancel a request
  cancelRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.userId; // Get from JWT middleware

      console.log(
        `Attempting to cancel request ${requestId} for user ${userId}`
      );

      // Find the request and verify ownership
      const request = await Request.findOne({ _id: requestId, userId });

      if (!request) {
        console.log("Request not found or does not belong to user");
        return res.status(404).json({
          message:
            "Request not found or you don't have permission to cancel it",
        });
      }

      // Check if request is pending
      if (request.status !== "pending") {
        console.log(`Cannot cancel request with status: ${request.status}`);
        return res.status(400).json({
          message: "Only pending requests can be cancelled",
        });
      }

      // Update the request status to cancelled
      const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        {
          status: "cancelled",
          updatedAt: new Date(), // Optional: if you want to track when it was cancelled
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      ).populate("item"); // Populate item details for the response

      if (!updatedRequest) {
        console.log("Failed to update request");
        return res.status(500).json({
          message: "Failed to cancel request",
        });
      }

      console.log("Request cancelled successfully:", updatedRequest);

      // Send the updated request back to the client
      res.status(200).json({
        message: "Request cancelled successfully",
        request: updatedRequest,
      });
    } catch (error) {
      console.error("Error in cancelRequest:", error);
      res.status(500).json({
        message: "Error cancelling request",
        error: error.message,
      });
    }
  },

  // Process a return
  processReturn: async (req, res) => {
    try {
      const { requestId } = req.params;
      
      // Find the request with populated fields
      const request = await Request.findById(requestId)
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

      // Log the return activity using activityService
      try {
        const adminUser = await User.findById(req.user.userId);
        if (adminUser) {
          await activityService.logActivity(
            req.user.userId,
            adminUser.name,
            adminUser.role,
            'return_item',
            `${adminUser.name} processed return of ${item.name} from ${request.userId.name}`
          );
        }
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Continue processing even if logging fails
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
  },
};

module.exports = borrowController;
