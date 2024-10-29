const express = require("express");
const router = express.Router();

// Reporting
router.get("/reports", adminController.viewReports);

// Error Handling
router.use((req, res, next) => {
  res.status(404).send("Page Not Found");
});

// Server Error Handling
router.use((err, req, res, next) => {
  res.status(500).send("Internal Server Error");
});

module.exports = router;
