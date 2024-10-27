import mongoose, { mongo } from "mongoose";
const { Schema } = mongoose;

const itemSchema = new Schema({
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
const itemModel = mongoose.model("item", itemSchema);
export default itemModel;
