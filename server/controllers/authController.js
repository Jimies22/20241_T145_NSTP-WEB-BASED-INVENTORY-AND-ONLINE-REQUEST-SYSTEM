import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistedToken.js";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  console.log("Google Login - Received data:", req.body);
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Find or create user with additional fields
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        role: "user",
        lastLogin: new Date(),
        createdAt: new Date(),
      });
    } else {
      // Update existing user's last login time and other fields that might have changed
      user = await User.findOneAndUpdate(
        { email: payload.email },
        {
          lastLogin: new Date(),
          picture: payload.picture,
          name: payload.name,
          given_name: payload.given_name,
          family_name: payload.family_name,
        },
        { new: true }
      );
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
        picture: user.picture,
        given_name: user.given_name,
        family_name: user.family_name,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
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
  console.log("Received recaptcha data:", req.body);
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

export const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // First verify ReCAPTCHA
    const recaptchaValid = await verifyRecaptchaToken(recaptchaToken);
    if (!recaptchaValid) {
      return res.status(400).json({
        success: false,
        message: "ReCAPTCHA verification failed",
      });
    }

    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        given_name: user.given_name,
        family_name: user.family_name,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
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

const verifyRecaptchaToken = async (token) => {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("ReCAPTCHA verification error:", error);
    return false;
  }
};
