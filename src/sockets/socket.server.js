const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");

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
      const [message, vectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          content: messagePayload.content,
          chat: messagePayload.chat,
          role: "user",
        }),
        generateVector(messagePayload.content),
      ]);

      //store the vectors in the vector database(pinecone database)
      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: messagePayload.content,
        },
      });

      // Query the vector database to get relevant context(long term memory)

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          topK: 3,
          metadata: { userId: socket.user._id, chatId: messagePayload.chat },
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      const stm = chatHistory.map((message) => {
        return {
          role: message.role,
          parts: [{ text: message.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `These are the most relevant pieces of information I found in your past conversations:${memory
                .map((item) => item.metadata.text)
                .join("\n")}`,
            },
          ],
        },
      ];

      const response = await generateResponse([...ltm, ...stm]);

      socket.emit("ai-response", {
        // Emit AI response to the user
        content: response,
        chat: messagePayload.chat,
        timestamp: new Date().toISOString(),
      });

      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          content: response,
          chat: messagePayload.chat,
          role: "model",
        }),
        generateVector(response),
      ]);

      await createMemory({
        vectors: responseVectors,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: response,
        },
        messageId: responseMessage._id,
      });
    });
  });
}

module.exports = initSocketServer;
