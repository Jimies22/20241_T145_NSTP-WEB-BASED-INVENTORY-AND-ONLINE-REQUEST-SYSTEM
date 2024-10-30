const express = require("express");
const router = express.Router();

// Reporting
router.get("/", (req, res) => {
  res.send({ data: "Reports" });
});

module.exports = router;
