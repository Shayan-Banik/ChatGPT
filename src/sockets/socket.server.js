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
      const message = await messageModel.create({
        user: socket.user._id,
        content: messagePayload.content,
        chat: messagePayload.chat,
        role: "user",
      });

      //use vector database to get context
      const vectors = await generateVector(messagePayload.content);

      // Query the vector database to get relevant context(long term memory)
      const memory = await queryMemory({
        queryVector: vectors,
        topK: 3,
        metadata: {},
      });

      //store the vectors in the vector database(pinecone database)
      await createMemory({
        vectors,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: messagePayload.content,
        },
        messageId: message._id,
      });
      console.log("Vectors:", vectors);

      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

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

      const responseMessage = await messageModel.create({
        user: socket.user._id,
        content: response,
        chat: messagePayload.chat,
        role: "model",
      });

      const responseVectors = await generateVector(response);

      await createMemory({
        vectors: responseVectors,
        metadata: {
          chatId: messagePayload.chat,
          userId: socket.user._id,
          text: response,
        },
        messageId: responseMessage._id,
      });

      console.log("Response Vectors:", responseVectors);

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
