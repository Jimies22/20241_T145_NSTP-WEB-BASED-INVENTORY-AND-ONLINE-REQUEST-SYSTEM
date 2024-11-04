// const express = require("express");
// const passport = require("passport");
// const session = require("express-session");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Session setup
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Serialize and deserialize user (for session management)
// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });

// // Configure Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Here you would typically search your database for the user
//       // For simplicity, we are just passing the profile
//       return done(null, profile);
//     }
//   )
// );

// // Routes for Google authentication
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     // Successful login
//     res.redirect("/dashboard");
//   }
// );

// // Route to display user profile (secured)
// app.get("/dashboard", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.send(`Welcome, ${req.user.displayName}`);
//   } else {
//     res.redirect("/");
//   }
// });

// // Route to handle logout
// app.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     res.redirect("/");
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
