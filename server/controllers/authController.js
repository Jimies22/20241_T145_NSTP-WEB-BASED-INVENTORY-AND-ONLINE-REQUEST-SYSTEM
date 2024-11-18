import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";

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

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        picture: payload.picture,
      });
    }

    // Generate JWT token
    const sessionToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
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
      message: "Login failed",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // If you're using a token blacklist
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      // Add token to blacklist in Redis or DB
      await BlacklistedToken.create({ token });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
