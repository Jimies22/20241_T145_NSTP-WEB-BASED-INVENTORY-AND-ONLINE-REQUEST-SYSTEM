import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createInitialAdmin } from "./controllers/loginController.js";

// Load environment variables first
dotenv.config();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB once
try {
  await mongoose.connect(process.env.MONGODB);
  console.log("DB connected successfully");
} catch (error) {
  console.error("MongoDB connection error:", error);
  process.exit(1);
}

import { run as testDbConnection } from "./config/testDB.js";
const app = express();

// CORS configuration
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
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
