// const express = require("express");
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const session = require("express-session");
// const dotenv = require("dotenv");

// dotenv.config();

// const app = express();

// // Express session middleware
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Add a session secret to your .env
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Configure Passport with Google strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback", // Your callback route
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Logic to find or create user in your database
//       // For example, you can save the user's Google profile information in your DB
//       return done(null, profile); // Pass the user profile to done
//     }
//   )
// );

// // Serialize user into session
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// // Deserialize user from session
// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// // Define Google Auth routes
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     // Successful authentication
//     res.redirect("/"); // Redirect to a desired route after login
//   }
// );

// // Add a logout route
// app.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect("/");
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
