const axios = require("axios");

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
