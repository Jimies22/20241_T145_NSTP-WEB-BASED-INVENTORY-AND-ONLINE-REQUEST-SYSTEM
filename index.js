const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const PORT = 3000;

const userRouter = require("./routes/User/userRoutes");
const requestRouter = require("./routes/Admin/adminRoutes");

// Update code for put and delete +++++++++++++++++++++
const itemRouter = require("./routes/User/userRoutes");
//const requestRouter = require("./routes/Admin/adminRoutes");

const pdfRoutes = require('./routes/pdfRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Endpoints
app.use("/user", userRouter);
app.use("/request", requestRouter);

app.use("/item", itemRouter);
// app.use("/request", requestRouter);
// Update code for put and delete +++++++++++++++++++++

app.use("/pdf", pdfRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
