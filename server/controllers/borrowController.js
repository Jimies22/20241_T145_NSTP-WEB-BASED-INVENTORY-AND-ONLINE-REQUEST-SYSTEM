const Request = require("../models/borrow");
const Item = require("../models/Item");

const borrowController = {
  createRequest: async (req, res) => {
    try {
      const { itemId, dateBorrow, dateReturn } = req.body;
      const userId = req.user.id;

      // Check if item exists and is available
      const item = await Item.findOne({ item_id: itemId });
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      if (!item.availability) {
        return res.status(400).json({ message: "Item is not available" });
      }

      // Create new request
      const newRequest = new Request({
        userId,
        itemId: item._id,
        dateBorrow: new Date(dateBorrow),
        dateReturn: new Date(dateReturn),
      });

      // Update item availability
      item.availability = false;
      item.status = "Pending";
      await item.save();

      const savedRequest = await newRequest.save();

      // Populate user and item details
      const populatedRequest = await Request.findById(savedRequest._id)
        .populate("userId", "name email")
        .populate("itemId", "name description");

      res.status(201).json(populatedRequest);
    } catch (error) {
      res.status(500).json({
        message: "Error creating request",
        error: error.message,
      });
    }
  },

  getAllRequests: async (req, res) => {
    try {
      const requests = await Request.find()
        .populate("userId", "name email")
        .populate("itemId", "name description")
        .sort({ dateCreated: -1 });
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching requests",
        error: error.message,
      });
    }
  },

  getUserRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await Request.find({ userId })
        .populate("itemId", "name description status")
        .sort({ dateCreated: -1 });
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching user requests",
        error: error.message,
      });
    }
  },

  updateRequestStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      const request = await Request.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Update item availability based on status
      const item = await Item.findById(request.itemId);
      if (status === "Approved") {
        item.availability = false;
        item.status = "Unavailable";
      } else if (status === "Rejected") {
        item.availability = true;
        item.status = "Available";
      }
      await item.save();

      request.status = status;
      const updatedRequest = await request.save();

      res.status(200).json(updatedRequest);
    } catch (error) {
      res.status(500).json({
        message: "Error updating request",
        error: error.message,
      });
    }
  },

  deleteRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findById(requestId);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Reset item availability if request is pending
      if (request.status === "Pending") {
        const item = await Item.findById(request.itemId);
        item.availability = true;
        item.status = "Available";
        await item.save();
      }

      await Request.findByIdAndDelete(requestId);
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting request",
        error: error.message,
      });
    }
  },
};

module.exports = borrowController;
