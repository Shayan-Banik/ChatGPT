const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

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

// Updated create handler to accept messages
const createChatsWithMessages = async (req, res) => {
  const { title, messages } = req.body;
  const user = req.user;

  const newChat = await chatModel.create({
    user: user._id,
    title,
    messages: messages || [],
  });

  res.status(201).json({
    message: "Chats created successfully",
    chat: newChat,
  });
};

const getChats = async (req, res) => {
  const user = req.user;
  const chats = await chatModel
    .find({ user: user._id })
    .sort({ updatedAt: -1 })
    .lean();

  // For each chat, load messages from the message collection (persistent store)
  const chatsWithMessages = await Promise.all(
    chats.map(async (c) => {
      // Fetch messages stored in the messageModel for this chat
      const msgs = await messageModel
        .find({ chat: c._id })
        .sort({ createdAt: 1 })
        .lean();
      const normalized = (msgs || []).map((m) => ({
        text: m.content,
        isBot: m.role === "model",
        timestamp: m.createdAt,
      }));

      // If the chat document also has a messages array (legacy/initial messages), append them after
      const combined = (c.messages || [])
        .map((m) => ({
          text: m.text,
          isBot: !!m.isBot,
          timestamp: m.timestamp,
        }))
        .concat(normalized);

      return {
        ...c,
        messages: combined,
      };
    })
  );

  res.status(200).json({ chats: chatsWithMessages });
};

const deleteChat = async (req, res) => {
  try {
    const user = req.user;
    const chatId = req.params.id;

    const chat = await chatModel.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Ensure ownership
    if (String(chat.user) !== String(user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete messages and chat
    await messageModel.deleteMany({ chat: chatId });
    await chatModel.findByIdAndDelete(chatId);

    return res.status(200).json({ message: "Chat deleted" });
  } catch (err) {
    console.error("Failed to delete chat", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createChats, createChatsWithMessages, getChats, deleteChat };
