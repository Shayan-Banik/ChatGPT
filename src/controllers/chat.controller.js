const chatModel = require("../models/chat.model");

const createChats = async (req, res) => {
  const { title } = req.body;
  const user = req.user;

  const newChat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chats created successfully",
    chat: {
      _id: newChat._id,
      title: newChat.title,
      lastActivity: newChat.lastActivity,
      user: newChat.user,
    },
  });
};

module.exports = { createChats };
