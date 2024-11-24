const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
