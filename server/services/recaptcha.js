const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/login", async (req, res) => {
  const { token } = req.body; // Capture reCAPTCHA token from frontend

  const secretKey = "6LdpdngqAAAAADHdIUUizeNegSf97j81z9HPwkko";
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await axios.post(verificationURL);
    if (response.data.success) {
      // reCAPTCHA passed - proceed with login
      res.send("Login successful");
    } else {
      // reCAPTCHA failed
      res.status(403).send("reCAPTCHA verification failed");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// const axios = require("axios");

app.post("/submit-form", async (req, res) => {
  const token = req.body["g-recaptcha-response"];
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;
    if (data.success) {
      // Handle successful form submission
      res.send("Form submitted successfully");
    } else {
      res.status(400).send("reCAPTCHA verification failed");
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    res.status(500).send("Error verifying reCAPTCHA");
  }
});
