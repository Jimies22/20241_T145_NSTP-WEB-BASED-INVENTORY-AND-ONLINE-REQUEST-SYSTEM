const express = require("express");
const router = express.Router();

// Reporting
router.get("/reports", adminController.viewReports);

module.exports = router;
