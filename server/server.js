import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import itemRoutes from "./routes/admin/itemRoute.js";
import userRoutes from "./routes/user/userRoutes.js";
import { errorHandler, notFound } from "./middleware/ervalMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

console.log("Starting server...");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Updated MongoDB connection options
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB Connected Successfully");
    console.log("Connection State:", mongoose.connection.readyState);
    console.log("Database Name:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

// Monitor MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Initial connection
connectWithRetry();

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Add error handling last
app.use(notFound);
app.use(errorHandler);

export default app;
