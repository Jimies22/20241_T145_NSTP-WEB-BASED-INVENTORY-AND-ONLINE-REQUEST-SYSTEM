const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  userId: {
    // current user data : id
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    // item requested
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  dateCreated: {
    // request created (use for logging)
    type: Date,
    default: Date.now,
  },
  dateBorrow: {
    // user define input for borrow date
    type: Date,
    required: true,
  },
  dateReturn: {
    // user define input for return date
    type: Date,
    required: true,
  },
  status: {
    // admin purpose, for request management
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Request", requestSchema);
