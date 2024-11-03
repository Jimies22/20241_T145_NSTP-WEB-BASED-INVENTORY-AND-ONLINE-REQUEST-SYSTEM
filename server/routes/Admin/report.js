// report generation
const express = require("express");
const router = express.Router();

// Reporting
router.get("/report", (req, res) => {
  res.send({ data: "Reports" });
});

module.exports = router;
