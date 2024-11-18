import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedToken.js";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        picture: payload.picture,
        role: "user", // Default role
      });
    }

    // Generate JWT
    const sessionToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // Add token to blacklist
      await BlacklistedToken.create({ token });

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Optional: Add a token validation function
export const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await BlacklistedToken.findOne({ token });
  return !!blacklistedToken;
};

export const verifyRecaptcha = async (req, res) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "ReCAPTCHA token is required",
      });
    }

    // Verify with Google
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (response.data.success) {
      res.json({
        success: true,
        message: "ReCAPTCHA verification successful",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "ReCAPTCHA verification failed",
      });
    }
  } catch (error) {
    console.error("ReCAPTCHA verification error:", error);
    res.status(500).json({
      success: false,
      message: "ReCAPTCHA verification failed",
    });
  }
};
