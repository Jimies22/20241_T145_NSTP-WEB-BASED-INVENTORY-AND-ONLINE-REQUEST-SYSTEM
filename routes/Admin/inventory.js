const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ data: "Item list" });
});

router.post("/", (req, res) => {
  res.send({ data: "Item Created" });
});

router.put("/", (req, res) => {
  res.send({ data: "Item Updated" });
});

router.delete("/", (req, res) => {
  res.send({ data: "Item Deleted" });
});

module.exports = router;
