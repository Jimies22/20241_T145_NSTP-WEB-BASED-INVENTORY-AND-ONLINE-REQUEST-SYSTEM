const Request = require("../models/borrow");
const User = require("../models/User");
const Item = require("../models/Item");

const borrowController = {
  // Create a new borrow request
  createRequest: async (req, res) => {
    try {
      const { item, borrowDate, returnDate, requestDate } = req.body; // Added requestDate
      const userId = req.user.userId; // Get userId from JWT middleware

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

      // Convert borrowDate, returnDate, and requestDate into Date objects
      const borrowDateObj = new Date(borrowDate);
      const returnDateObj = new Date(returnDate);
      const requestDateObj = new Date(requestDate); // Convert requestDate to Date object

      console.log("Borrow Date from Request:", borrowDate);
      console.log("Return Date from Request:", returnDate);
      console.log("Request Date from Request:", requestDate);

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

      // Save the request in the database
      const newRequest = new Request({
        userId,
        item,
        borrowDate: borrowDateObj,
        returnDate: returnDateObj,
        requestDate: requestDateObj, // Store requestDate as Date object
        status: "pending",
      });

      const savedRequest = await newRequest.save();
      console.log("Saved Request:", savedRequest); // Log the saved request for debugging
      res.status(201).json(savedRequest);
    } catch (error) {
      console.error("Error creating request:", error); // Log the error for debugging
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
      const userId = req.user.userId; // From JWT middleware
      const requests = await Request.find({ userId }).populate("item"); // Populate item details
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching user requests",
        error: error.message,
      });
    }
  },

  // Update request status (for admin)
  updateRequestStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        { status },
        { new: true }
      );

      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.status(200).json(updatedRequest);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating request", error: error.message });
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
      const userId = req.user.userId;

      const request = await Request.findOne({ _id: requestId, userId });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (request.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending requests can be cancelled" });
      }

      const updatedRequest = await Request.findByIdAndUpdate(
        requestId,
        { status: "cancelled" }, // Changed to lowercase to match schema
        { new: true }
      ).populate("item");

      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.status(200).json(updatedRequest);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error cancelling request", error: error.message });
    }
  },
};

module.exports = borrowController;
