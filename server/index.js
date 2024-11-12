import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import {
  createInitialAdmin,
  verifyAdmin,
} from "./controllers/adminLoginController.js";

// Load environment variables first
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
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

// Protected routes example
app.use("/api/admin/settings", verifyAdmin, settingsRoute);

// Route middleware
app.use("/api/auth/admin", authAdminRoute);
app.use("/api/admin/inventory", inventoryAdminRouter);
app.use("/api/data/user", userRoute);

// Backend connection test endpoint
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

// Start server with enhanced initialization
app.listen(PORT, async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    console.log(`Server is running on port ${PORT}`);
    await createInitialAdmin();
    console.log("Server initialization completed");
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
});
