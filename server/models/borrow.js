const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
    required: true,
  },
  requestDate: { type: Date, default: Date.now, required: true },
  borrowDate: { type: Date },
  returnDate: { type: Date },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
