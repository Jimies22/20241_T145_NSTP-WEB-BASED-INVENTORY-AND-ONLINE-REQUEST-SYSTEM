const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateBorrow: {
    type: Date,
    required: true,
  },
  dateReturn: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Request", requestSchema);
