const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Import the testdb connection
const { run: testDbConnection } = require("./config/testDB");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB);

// second test
if (mongoose.connect(process.env.MONGODB)) {
  console.log("DB connected");
} else {
  console.log("connection error");
}

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 })
);
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, URL: ${req.url}`);
  next();
});

// Admin routes
const dashboardAdminRoute = require("./routes/Admin/dashboard");
const authAdminRouter = require("./routes/Admin/auth");
const inventoryAdminRouter = require("./routes/Admin/inventory");
const notificationAdminRouter = require("./routes/Admin/notification");
const reportRouter = require("./routes/Admin/report");
const requestRouter = require("./routes/Admin/request");

// User routes
const authRouter = require("./routes/User/authRoute");
const userRouter = require("./routes/User/userRoute");
const bookingRouter = require("./routes/User/bookingRoute");
const dashboardRouter = require("./routes/User/dashboardRoute");
const inventoryRouter = require("./routes/User/inventoryRoute");
const notificationRouter = require("./routes/User/notificationRoute");

// Admin API routes
app.use("/api/admin/dashboard", dashboardAdminRoute);
app.use("/api/admin/login", authAdminRouter);
app.use("/api/admin/inventory", inventoryAdminRouter);
app.use("/api/admin/notifications", notificationAdminRouter);
app.use("/api/admin/reports", reportRouter);
app.use("/api/admin/requests", requestRouter);

// User API routes
app.use("/api/user/auth", authRouter);
app.use("/api/user/profile", userRouter);
app.use("/api/user/bookings", bookingRouter);
app.use("/api/user/dashboard", dashboardRouter);
app.use("/api/user/inventory", inventoryRouter);
app.use("/api/user/notifications", notificationRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

// Start the server and run the test DB connection
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Test the MongoDB connection by calling the function from testdb.js
  await testDbConnection();
});
