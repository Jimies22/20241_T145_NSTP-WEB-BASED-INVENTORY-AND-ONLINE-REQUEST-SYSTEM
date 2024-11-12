// Import dotenv to load environment variables
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); // Load environment variables only once

// Function to test the MongoDB connection
export async function run() {
  try {
    // Connect only once using mongoose
    await mongoose.connect(process.env.MONGODB, {
      // Remove deprecated options
    });

    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
