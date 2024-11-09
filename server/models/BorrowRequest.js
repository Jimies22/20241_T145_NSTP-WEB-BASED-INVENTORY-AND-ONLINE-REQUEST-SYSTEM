import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const borrowSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  item_id: {
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
  Date: {
    type: Date,
    default: Date.now,
  },
  reqDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});
const borrowModel = mongoose.model("borrow", borrowSchema);
export default borrowModel;
