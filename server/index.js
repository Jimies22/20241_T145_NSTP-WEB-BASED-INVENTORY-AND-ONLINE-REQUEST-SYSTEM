const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

// dotenv configuration
dotenv.config();
// connect to database
const PORT = process.env.PORT;

// local db connection
mongoose
  .connect("mongodb://localhost/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Connection error", err));

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

// define Admin routes
const authAdminRouter = require("./routes/Admin/auth");
const inventoryAdminRouter = require("./routes/Admin/inventory");
const notificationAdminRouter = require("./routes/Admin/notification");
const reportRouter = require("./routes/Admin/report");
const requestRouter = require("./routes/Admin/request");

// define User routes
const authRouter = require("./routes/User/authRoute");
const userRouter = require("./routes/User/userRoute");
const bookingRouter = require("./routes/User/bookingRoute");
const dashboardRouter = require("./routes/User/dashboardRoute");
const inventoryRouter = require("./routes/User/inventoryRoute");
const notificationRouter = require("./routes/User/notificationRoute");

// Admin API routes
app.use("/api/admin/login", authAdminRouter); // login
app.use("/api/admin/inventory", inventoryAdminRouter); // inventory mangement
app.use("/api/admin/notifications", notificationAdminRouter); // admin notifications
app.use("/api/admin/reports", reportRouter); // admin reports
app.use("/api/admin/requests", requestRouter); // admin request managment

// User API routes
app.use("/api/user/auth", authRouter); // Authentication routes
app.use("/api/user/profile", userRouter); // User profile management
app.use("/api/user/bookings", bookingRouter); // Booking management
app.use("/api/user/dashboard", dashboardRouter); // User dashboard data
app.use("/api/user/inventory", inventoryRouter); // Inventory access
app.use("/api/user/notifications", notificationRouter); // Notifications access

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
