const express = require("express");
const router = express.Router();

// Reporting
router.get("/reports", (req, res) => {
  res.send({ data: "Reports" });
});

module.exports = router;
