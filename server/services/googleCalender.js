// const express = require("express");
// const { google } = require("googleapis");
// const dotenv = require("dotenv");
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Set up OAuth2 client
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// // Scopes for accessing Google Calendar
// const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// //__________________________

// app.get("/auth", (req, res) => {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   res.redirect(authUrl);
// });

// //+++++++++++++++++++++++++++++++++++++++++++++++

// app.get("/oauth2callback", async (req, res) => {
//   const code = req.query.code;

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     res.send("Authentication successful! You can now make API requests.");
//   } catch (error) {
//     console.error("Error retrieving access token", error);
//     res.send("Error authenticating");
//   }
// });

// //++++++++++++++++++++++++++++++++++++++++++++++++

// app.get("/events", async (req, res) => {
//   const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//   try {
//     const response = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: new Date().toISOString(),
//       maxResults: 10,
//       singleEvents: true,
//       orderBy: "startTime",
//     });
//     const events = response.data.items;
//     if (events.length) {
//       res.json(events);
//     } else {
//       res.send("No upcoming events found.");
//     }
//   } catch (error) {
//     console.error("The API returned an error:", error);
//     res.status(500).send("Error retrieving events");
//   }
// });

// // +++++++++++++++++++++++++++++++++++++++++++++

// app.post("/create-event", async (req, res) => {
//   const calendar = google.calendar({ version: "v3", auth: oauth2Client });

//   const event = {
//     summary: "Google Calendar Event",
//     location: "123 Main St, Anytown, USA",
//     description: "This is a test event.",
//     start: {
//       dateTime: "2023-12-31T10:00:00-07:00", // Replace with dynamic values
//       timeZone: "America/Los_Angeles",
//     },
//     end: {
//       dateTime: "2023-12-31T11:00:00-07:00",
//       timeZone: "America/Los_Angeles",
//     },
//   };

//   try {
//     const response = await calendar.events.insert({
//       calendarId: "primary",
//       resource: event,
//     });
//     res.send(`Event created: ${response.data.htmlLink}`);
//   } catch (error) {
//     console.error("Error creating event", error);
//     res.status(500).send("Error creating event");
//   }
// });
