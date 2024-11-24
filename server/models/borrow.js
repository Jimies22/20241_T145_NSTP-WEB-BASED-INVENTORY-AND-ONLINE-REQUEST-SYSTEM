const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, // Reference to Item
  status: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
    required: true,
  },
  requestDate: { type: Date, default: Date.now },
  borrowDate: { type: Date },
  returnDate: { type: Date },
});

module.exports = mongoose.model("Request", requestSchema);
