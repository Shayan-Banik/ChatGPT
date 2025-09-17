const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie"); // 👈 helps parse cookies
const userModel = require("../models/user.model");
const  generateResponse  = require("../service/ai.service");
// const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  // Middleware for authentication(Only who registered they can connect to the chat)
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided!"));
      }

      // Verify token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in DB
      const user = await userModel.findById(decodedToken.id);
      if (!user) {
        return next(new Error("Authentication error: User not found!"));
      }

      // Attach user to socket object
      socket.user = user;

      next();
    } catch (error) {
      console.error("Invalid token:", error.message);
      next(new Error("Authentication error: Invalid token!"));
    }
  });

  io.on("connection", (socket) => {
    //user sends a message to the chat
    socket.on("user-message", async (messagePayload) => {
      // Store the message in the database(Which send by the user)
      await messageModel.create({
        user: socket.user._id,
        content: messagePayload.content,
        chat: messagePayload.chat,
        role: "user",
      });

      const chatHistory = await messageModel.find({
        chat: messagePayload.chat,
      });

      const response = await generateResponse(
        chatHistory.map((message) => {
          return {
            role: message.role,
            parts: [{ text: message.content }],
          };
        })
      );
      // const response = await aiService.generateResponse(messagePayload.content);

      await messageModel.create({
        user: socket.user._id,
        content: response,
        chat: messagePayload.chat,
        role: "model",
      });

      socket.emit("ai-response", {
        // Emit AI response to the user
        content: response,
        chat: messagePayload.chat,
        timestamp: new Date().toISOString(),
      });
    });
  });
}

module.exports = initSocketServer;
