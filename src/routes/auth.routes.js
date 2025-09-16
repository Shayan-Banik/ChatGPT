const express = require("express");
const router = express.Router();
const {userRegister, userLogin} = require("../controllers/auth.controller.js");

router.post("/register", userRegister);
router.post("/login", userLogin);

// router.post("/login", (req, res) => {
//   console.log("Login route hit!");
//   res.json({ message: "Login route works!" });
// });


module.exports = router;
