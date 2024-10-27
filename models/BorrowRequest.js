import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const borrowSchema = new Schema({
  name: {
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
});
const borrowModel = mongoose.model("borrow", borrowSchema);
export default borrowModel;
