const express = require("express");
const router = express.Router();

router.get("/api/admin/list", (req, res) => {
  res.send({ data: "Item list" });
});

router.post("/api/admin/add", (req, res) => {
  res.send({ data: "Item Created" });
});

router.put("/api/admin/update", (req, res) => {
  res.send({ data: "Item Updated" });
});

router.delete("/api/admin/delete", (req, res) => {
  res.send({ data: "Item Deleted" });
});

module.exports = router;
