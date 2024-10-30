const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/User/authRoute");
const userRouter = require("./routes/User/userRoute");
const bookingRouter = require("./routes/User/bookingRoutes");
const dashboardRouter = require("./routes/User/dashboardRoute");
const inventoryRouter = require("./routes/User/inventoryRoute");
const notificationRouter = require("./routes/User/notificationRoute");

//app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 })
);

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/booking", bookingRouter);
app.use("/dashboard", dashboardRouter);
app.use("/inventory", inventoryRouter);
app.use("/notifications", notificationRouter);

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
