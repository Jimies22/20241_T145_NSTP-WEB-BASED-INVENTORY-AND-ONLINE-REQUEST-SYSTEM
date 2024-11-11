import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const handleGoogleLogin = async (req, res) => {
  try {
    console.log("Received user data:", req.body);
    const { email, name, picture, given_name, family_name, googleId } =
      req.body;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        name,
        picture,
        given_name,
        family_name,
        googleId,
        role: "user", // default role
      });
      await user.save();
    } else {
      // Update existing user's info
      user.lastLogin = new Date();
      user.picture = picture;
      user.name = name;
      await user.save();
    }

    console.log("User saved:", user);

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

    // Send response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // If you're using a token blacklist or session store
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      // Add token to blacklist or remove session
      // await BlacklistedToken.create({ token });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};
