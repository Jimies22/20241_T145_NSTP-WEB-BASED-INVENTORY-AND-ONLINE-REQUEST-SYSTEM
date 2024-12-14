const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item",
    required: true 
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled", "returned"],
    default: "pending",
    required: true,
  },
  requestDate: { type: Date, default: Date.now, required: true },
  borrowDate: { type: Date },
  returnDate: { type: Date },
  actualReturnDate: { type: Date },
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
