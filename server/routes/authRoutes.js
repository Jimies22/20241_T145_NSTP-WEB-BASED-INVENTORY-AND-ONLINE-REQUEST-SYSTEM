// // main page for authentication routes

// import express from "express";
// import { json, urlencoded } from "body-parser";
// import { config } from "dotenv";
// import rateLimit from "express-rate-limit";
// import authRoutes from "./routes/auth";

// config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(json());
// app.use(urlencoded({ extended: true }));

// // Rate limiter for all routes (optional, can be applied individually)
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
// });
// app.use(globalLimiter);

// // Use the authentication routes
// app.use("/", authRoutes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
