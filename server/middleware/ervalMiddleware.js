import { body, validationResult } from "express-validator";

// Validation middleware for user creation/updates
export const validateUser = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("name").notEmpty().withMessage("Name is required"),
  body("role").isIn(["user", "admin"]).withMessage("Invalid role"),
  body("department").optional().isString(),
  body("userID").optional().isInt().withMessage("User ID must be an integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Rate limiting middleware
export const rateLimiter = (req, res, next) => {
  // Add your rate limiting logic here
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Not found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Add this validation
export const validateUserID = [
  body("userID").isInt().withMessage("User ID must be an integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
