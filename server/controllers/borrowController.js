const Request = require("../models/borrow");
const User = require("../models/User");
const Item = require("../models/Item");

const borrowController = {
  // Create a new borrow request
  createRequest: async (req, res) => {
    try {
      const { item, borrowDate, returnDate } = req.body; // Get itemId from request body
      const userId = req.user.userId; // Get userId from JWT middleware

      // Validate if userId exists in the database
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({ message: `User not found: ${userId}` });
      }

      // Validate if itemId exists in the database
      const itemExists = await Item.findById(item);
      if (!itemExists) {
        return res.status(404).json({ message: `Item not found: ${item}` });
      }

      // Validate that borrowDate and returnDate are on the same day
      const borrowDateObj = new Date(borrowDate);
      const returnDateObj = new Date(returnDate);

      if (borrowDateObj.toDateString() !== returnDateObj.toDateString()) {
        return res
          .status(400)
          .json({ message: "Borrow and return dates must be the same day." });
      }

      // Validate that returnDate is after borrowDate
      if (returnDateObj <= borrowDateObj) {
        return res
          .status(400)
          .json({ message: "Return date must be after borrow date." });
      }

      const newRequest = new Request({
        userId,
        item: item,
        borrowDate,
        returnDate,
        status: "pending", // Default status
      });

      const savedRequest = await newRequest.save();
      res.status(201).json(savedRequest);
    } catch (error) {
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
      const userId = req.user.id; // From JWT middleware
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
};

module.exports = borrowController;
