const express = require("express");
const router = express.Router();

router.get("/api/user/view-profile", (req, res) => {
  //res.send({ data: "Here is the data you requested" });
  res.send({ data: "Here is the data of user/users you requested" });
});

router.post("/api/user/new-account", (req, res) => {
  res.send({ data: "User Created" });
});

router.put("/api/user/update-account", (req, res) => {
  res.send({ data: "User Updated" });
});

router.delete("/api/user/delete_account", (req, res) => {
  res.send({ data: "User Deleted" });
});

module.exports = router;
