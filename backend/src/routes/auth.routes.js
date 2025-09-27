const express = require("express");
const router = express.Router();
const {
  userRegister,
  userLogin,
  userMe,
  userLogout,
} = require("../controllers/auth.controller.js");
const { authUser } = require("../middlewares/auth.middleware");

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/me", authUser, userMe);
router.post("/logout", userLogout);

module.exports = router;
