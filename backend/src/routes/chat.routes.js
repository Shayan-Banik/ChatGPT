const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware.authUser,
  chatController.createChatsWithMessages || chatController.createChats
);
router.get("/", authMiddleware.authUser, chatController.getChats);
router.delete("/:id", authMiddleware.authUser, chatController.deleteChat);

module.exports = router;
