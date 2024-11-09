import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import cors from "cors";

config(); // Load environment variables
import { run as testDbConnection } from "./config/testDB.js"; // Import the testdb connection
const app = express();
const PORT = process.env.PORT;
connect(process.env.MONGODB);

// second test
if (connect(process.env.MONGODB)) {
  console.log("DB connected");
} else {
  console.log("connection error");
}

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(json({ limit: "50mb" })); // Middleware
app.use(urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, URL: ${req.url}`);
  next();
});

import userRoute from "./routes/UAData/userRoute.js"; // Import the user route from UAData directory

// Admin routes
// import dashboardAdminRoute from "./routes/Admin/dashboard.js";
// import authAdminRouter from "./routes/Admin/auth.js";
// import inventoryAdminRouter from "./routes/Admin/inventory.js";
// import notificationAdminRouter from "./routes/Admin/notification.js";
// import reportRouter from "./routes/Admin/report.js";
// import requestRouter from "./routes/Admin/request.js";

// User routes
// import authRouter from "./routes/User/authRoute.js";
// import userRouter from "./routes/User/userRoute.js";
// import bookingRouter from "./routes/User/bookingRoute.js";
// import dashboardRouter from "./routes/User/dashboardRoute.js";
// import inventoryRouter from "./routes/User/inventoryRoute.js";
// import notificationRouter from "./routes/User/notificationRoute.js";

// Admin API routes
app.use("/api/data/user", userRoute);

// app.use("/api/admin/dashboard", dashboardAdminRoute);
// app.use("/api/admin/login", authAdminRouter);
// app.use("/api/admin/inventory", inventoryAdminRouter);
// app.use("/api/admin/notifications", notificationAdminRouter);
// app.use("/api/admin/reports", reportRouter);
// app.use("/api/admin/requests", requestRouter);

// User API routes
// app.use("/api/user/auth", authRouter);
// app.use("/api/user/profile", userRouter);
// app.use("/api/user/bookings", bookingRouter);
// app.use("/api/user/dashboard", dashboardRouter);
// app.use("/api/user/inventory", inventoryRouter);
// app.use("/api/user/notifications", notificationRouter);

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
