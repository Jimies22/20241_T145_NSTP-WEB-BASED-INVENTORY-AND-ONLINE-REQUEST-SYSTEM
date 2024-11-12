import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createInitialAdmin } from "./controllers/loginController.js";

// Load environment variables first
dotenv.config();
const PORT = process.env.PORT || 3000;

// Enhanced MongoDB connection with better error handling
try {
  await mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB Atlas successfully");

  // Test database operations (from test.js)
  const collections = await mongoose.connection.db.collections();
  console.log("Available collections:");
  collections.forEach((collection) => {
    console.log(" -", collection.collectionName);
  });
} catch (error) {
  console.error("MongoDB connection error:", error);
  process.exit(1);
}

import { run as testDbConnection } from "./config/testDB.js";
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method}: ${req.url}`);
  next();
});

// Import routes
import authAdminRoute from "./routes/authRoutes.js";
import settingsRoute from "./routes/Admin/settingsRoute.js";
import inventoryAdminRouter from "./routes/Admin/inventory.js";
import userRoute from "./routes/UAData/userRoute.js";

// Route middleware
app.use("/api/auth", authAdminRoute);
app.use("/api/admin/settings", settingsRoute);
app.use("/api/admin/inventory", inventoryAdminRouter);
app.use("/api/data/user", userRoute);

// Backend connection test endpoint (from server.js)
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is connected!",
    dbStatus:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// MongoDB connection event handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Start server with enhanced initialization
app.listen(PORT, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
    await testDbConnection();
    await createInitialAdmin();
    console.log("Server initialization completed");
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
});
