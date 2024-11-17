import mongoose from "mongoose";

// Log request details
export const logRequest = (req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} request for '${req.url}'`);
  next();
};

// Validate required fields for item creation/update
export const validateItemFields = (req, res, next) => {
  const { name, description, photo } = req.body;

  if (!name || !description || !photo) {
    return res.status(400).json({
      success: false,
      message: "Name, description, and photo are required fields",
    });
  }
  next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid item ID format",
    });
  }
  next();
};

// Log detailed request information
export const logDetailedRequest = (req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(
    `[${currentTime}] ${req.method} request for '${req.url}' with body:`,
    req.body
  );
  next();
};
