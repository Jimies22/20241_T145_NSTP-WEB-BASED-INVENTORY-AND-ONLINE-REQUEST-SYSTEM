import mongoose from "mongoose";
const { Schema } = mongoose;

const adminModel = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const adminModelData = mongoose.model("user", adminModel);
export default adminModelData;
