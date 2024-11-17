// models/User.js
import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    picture: String,
    department: String,
    userID: { type: Number, unique: true, required: true },
    googleId: String, // If you are using Google login, this might be needed
  },
  { timestamps: true }
);

userSchema.methods.generateGoogleId = function () {
  if (!this.googleId) {
    this.googleId = uuidv4();
  }
};

const User = model("User", userSchema);

export default User;
