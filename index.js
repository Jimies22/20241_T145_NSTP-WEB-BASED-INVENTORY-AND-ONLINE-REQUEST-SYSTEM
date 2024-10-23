const express = require("express");
const { console } = require("inspector");
const app = express();
const PORT = 6969;

const userRouter = require("./routes/user");
const requestRouter = require("./routes/request");

app.use("/user", userRouter);
app.use("/request", requestRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
