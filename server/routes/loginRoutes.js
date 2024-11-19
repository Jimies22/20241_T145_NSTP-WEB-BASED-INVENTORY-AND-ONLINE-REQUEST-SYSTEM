const express = require("express");
const { loginUser, loginAdmin } = require("../services/loginService");

const router = express.Router();

router.post("/google", loginUser);
router.post("/admin", loginAdmin);

module.exports = router;
