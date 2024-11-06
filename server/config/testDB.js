// Import dotenv to load environment variables
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

dotenv.config(); // Load environment variables only once

const client = new MongoClient(process.env.MONGODB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to test the MongoDB connection
export async function run() {
  // Use 'export' to make this function available for ES modules
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error", error);

    process.exit(1); // Exit with failure
  } finally {
    await client.close();
  }
}
