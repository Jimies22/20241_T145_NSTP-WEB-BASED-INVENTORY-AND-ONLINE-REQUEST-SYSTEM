import { Schema, model } from "mongoose";

const itemSchema = new Schema({
  item_id: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: Buffer,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isArchived: { type: Boolean, default: false },
});

const Item = model("Item", itemSchema);

export default Item;
