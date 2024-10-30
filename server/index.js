// const express = require("express");
// const app = express();
// const PORT = process.env.PORT || 6969;

// //const userRouter = require("./routes/user");
// const userRouter = require("./routes/User/userRoutes");

// // const requestRouter = require("./routes/User/");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/user", userRouter);
// app.use("/request", requestRouter);

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.use((req, res, next) => {
//   console.log(`Request Method: ${req.method}, URL: ${req.url}`);
//   next();
// });

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).send("Internal Server Error");
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express"); // Corrected the require statement
const app = express();
const PORT = process.env.PORT || 3000;

const userRouter = require("./routes/User/userRoute"); // Ensure the path is correct
const bookingRouter = require("./routes/User/bookingRoutes"); // Ensure the path is correct
const dashboardRouter = require("./routes/User/dashboardRoute"); // Add the new import
const inventoryRouter = require("./routes/User/inventoryRoute"); // Add the new import
const notificationRouter = require("./routes/User/notificationRoute"); // Add the new import

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
