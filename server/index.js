const express = require("express");
const { console } = require("inspector");
const app = express();
const PORT = 3000;

// const userRouter = require("./routes/User/userRoutes");
// const requestRouter = require("./routes/Admin/adminRoutes");
// Update code for put and delete +++++++++++++++++++++
// const userRouter = require("./routes/User/userRoutes");
// const requestRouter = require("./routes/Admin/adminRoutes");

// Updated for User

const bookingRouter = require("./routes/User/booking");
const userDashboardRouter = require("./routes/User/dashboard");
//const userRouter = require("./routes/User/user");
const userNotificationRouter = require("./routes/User/notification");
const userAuthRouter = require("./routes/User/auth");

//const userProfileRouter = require("./routes/User/profile");

// Updated for Admin
// const adminRouter = require("./routes/Admin/admin");
// const authRouter = require("./routes/Admin/auth");

// Endpoints
//app.use("/user", userRouter);
app.use("/api/user/request", bookingRouter);
app.use("/api/user/dashboard", userDashboardRouter);
app.use("/api/user/notification", userNotificationRouter);
app.use("/api/user/auth/login", userAuthRouter);

// Update code for put and delete +++++++++++++++++++++
// app.use("/request", requestRouter);
// app.use("/request", requestRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const express = require("express");
// const { console } = require("inspector");
// const app = express();
// const PORT = 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
