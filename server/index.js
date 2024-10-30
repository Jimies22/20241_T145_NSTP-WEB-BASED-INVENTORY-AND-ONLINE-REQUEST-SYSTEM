const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// User routes
const authRouter = require("./routes/User/authRoute");
const userRouter = require("./routes/User/userRoute");
const bookingRouter = require("./routes/User/bookingRoute");
const dashboardRouter = require("./routes/User/dashboardRoute");
const inventoryRouter = require("./routes/User/inventoryRoute");
//const notificationRouter = require("./routes/User/notificationRoute");

// Admin routes
//const adminAuthRouter = require("./routes/Admin/authRoute");
const authAdminRouter = require("./routes/Admin/auth");
const inventoryAdminRouter = require("./routes/Admin/inventory");
const notificationAdminRouter = require("./routes/Admin/notification");
const reportRouter = require("./routes/Admin/report");
const requestRouter = require("./routes/Admin/request");

//app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 })
);

// User
app.use("/api/user/auth", authRouter);
app.use("/api/user/user", userRouter);
app.use("/api/user/booking", bookingRouter);
app.use("/api/user/dashboard", dashboardRouter);
app.use("/api/user/inventory", inventoryRouter);
//app.use("/notifications", notificationRouter);

// Admin
//app.use("/admin/auth", adminAuthRouter);
app.use("/api/admin/login", authAdminRouter);
app.use("/api/admin/signup", inventoryAdminRouter);
app.use("/api/admin/notifications", notificationAdminRouter);
app.use("/api/admin/reports", reportRouter);
app.use("/api/admin/requests", requestRouter);

// Admin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, URL: ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
