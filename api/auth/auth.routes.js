const express = require("express");
const { login, signup, update, logout } = require("./auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.put("/update/:id", update);

module.exports = router;
