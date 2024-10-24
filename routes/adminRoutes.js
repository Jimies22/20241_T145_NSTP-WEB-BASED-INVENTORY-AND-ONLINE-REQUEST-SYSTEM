const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ data: "Here is the request you made" });
});

router.post("/", (req, res) => {
  res.send({ data: "Request Created" });
});

router.put("/", (req, res) => {
  res.send({ data: "Request Updated" });
});

router.delete("/", (req, res) => {
  res.send({ data: "Request Deleted" });
});

module.exports = router;
