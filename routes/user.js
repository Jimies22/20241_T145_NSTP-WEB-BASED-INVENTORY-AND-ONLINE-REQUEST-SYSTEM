const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ data: "Here is the data you requested" });
});

router.post("/", (req, res) => {
  res.send({ data: "User Created" });
});

router.put("/", (req, res) => {
  res.send({ data: "User Updated" });
});

router.delete("/", (req, res) => {
  res.send({ data: "User Deleted" });
});

module.exports = router;
