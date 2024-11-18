import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

// Import middleware
import { errorHandler, notFound } from "./middleware/ervalMiddleware.js";
import {
  limiter,
  authenticateToken,
  authorizeAdmin,
} from "./middleware/erval2Middleware.js";

// Import routes
import authRoutes from "./routes/loginRoute.js";
import userRoutes from "./routes/user/userRoutes.js";
import itemRoutes from "./routes/admin/itemRoute.js";
import protectedRoutes from "./routes/protectedRoutes.js";

// Initialize dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

console.log("Starting server...");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
};

app.use(cors(corsOptions));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

app.use(limiter);

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
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/items", authenticateToken, authorizeAdmin, itemRoutes);
app.use("/api/protected", authenticateToken, protectedRoutes);

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export default app;
