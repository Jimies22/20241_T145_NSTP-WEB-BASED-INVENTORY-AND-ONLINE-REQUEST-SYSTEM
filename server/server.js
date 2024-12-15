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
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
const lockRoutes = require("./routes/lockRoutes");
const path = require("path");
const pdfRoutes = require('./routes/pdfRoutes');
const activityRoutes = require('./routes/ActivityRoutes');

require("dotenv").config();
require("./config/passport");
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        .json({ message: "Unauthorized: Invalid or expired token 1" });
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
app.use("/borrow", borrowRoutes);
app.use("/notify", notificationRoutes);
app.use("/locks", lockRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/pdf", pdfRoutes);
app.use('/activity', activityRoutes);

// Logout route to clear the session
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export the middleware
module.exports = { jwtVerifyMiddleware };

// Add this near the top after loading dotenv
console.log("Environment check:", {
  hasMongoUri: !!process.env.MONGODB_URI,
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasEmailCreds: !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
});

// Add this test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "Server is running",
    environment: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEmailCreds: !!(
        process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD
      ),
    },
  });
});

// Add this temporary route to your server.js for testing
app.get("/check-user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json({
      exists: !!user,
      user: user
        ? {
            email: user.email,
            role: user.role,
            name: user.name,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this logging
console.log("Email configuration:", {
  emailUser: process.env.EMAIL_USER,
  hasAppPassword: !!process.env.EMAIL_APP_PASSWORD,
  appPasswordLength: process.env.EMAIL_APP_PASSWORD?.length,
});

// Add this temporary test code to your server.js
const { sendTestEmail } = require("./services/emailService");

// Add this test endpoint
app.get("/test-email/:email", async (req, res) => {
  try {
    await sendTestEmail(req.params.email);
    res.json({ message: "Test email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = { 
  jwtVerifyMiddleware 
};