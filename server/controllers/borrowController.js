const Request = require("../models/borrow");

const borrowController = {
  // Create a new borrow request
  createRequest: async (req, res) => {
    try {
      const { userId, itemId, borrowDate, returnDate } = req.body; // Get userId and itemId from request body
      const newRequest = new Request({
        userId,
        item: itemId,
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
      const requests = await Request.find().populate("userId", "name email");
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
      const requests = await Request.find({ userId });
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
