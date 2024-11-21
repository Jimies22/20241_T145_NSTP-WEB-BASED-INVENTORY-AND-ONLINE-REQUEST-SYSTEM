const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const itemRoutes = require("./routes/itemRoutes");
const loginRoutes = require("./routes/loginRoutes");
const borrowRoutes = require("./routes/borrowRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();
require("./config/passport");
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  })
);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.use(express.json());

// Initialize session and passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Middleware to verify JWT
const jwtVerifyMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

// Google authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect based on role
    if (req.user.role === "admin") {
      res.redirect("/admin");
    } else if (req.user.role === "user") {
      res.redirect("/user");
    } else {
      res.redirect("/login"); // Or handle unknown roles
    }
  }
);

// Route to check the logged-in user's role
app.get("/user", jwtVerifyMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/admin", jwtVerifyMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    res.json({ message: "Welcome to the Admin Dashboard" });
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
});

// Use the user routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/items", itemRoutes);
app.use("/login", loginRoutes);
//app.use("/borrow", borrowRoutes);
//app.use("/admin", adminRoutes);

// Update the logout route
app.post("/logout", jwtVerifyMiddleware, (req, res) => {
  try {
    // Clear the session
    req.logout(() => {
      // Clear any session data
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error during logout" });
        }
        // Send successful response
        res.clearCookie("connect.sid"); // Clear session cookie
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
