const express = require("express");
const { console } = require("inspector");
const app = express();
const PORT = 3000;

const userRouter = require("./routes/User/userRoutes");
const requestRouter = require("./routes/Admin/adminRoutes");

// Update code for put and delete +++++++++++++++++++++
// const userRouter = require("./routes/User/userRoutes");
// const requestRouter = require("./routes/Admin/adminRoutes");

// Endpoints
app.use("/user", userRouter);
app.use("/request", requestRouter);

// Update code for put and delete +++++++++++++++++++++
// app.use("/request", requestRouter);
// app.use("/request", requestRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
