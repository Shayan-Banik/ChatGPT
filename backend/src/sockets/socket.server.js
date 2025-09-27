const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");
const { safeGenerateVector } = require("../service/ai.service"); // import safe wrapper

async function initSocketServer(httpServer) {
  const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }
        return callback(new Error("CORS error: origin not allowed"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ✅ Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided!"));
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userModel.findById(decodedToken.id);
      if (!user) {
        return next(new Error("Authentication error: User not found!"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Invalid token:", error.message);
      next(new Error("Authentication error: Invalid token!"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("user-message", async (messagePayload) => {
      try {
        // 1. Save message in DB first
        const message = await messageModel.create({
          user: socket.user._id,
          content: messagePayload.content,
          chat: messagePayload.chat,
          role: "user",
        });

        // 2. Generate vectors (retry-safe)
        const vectors = await safeGenerateVector(messagePayload.content);

        // 3. Store vectors in Pinecone
        await createMemory({
          vectors,
          messageId: message._id,
          metadata: {
            chatId: messagePayload.chat,
            userId: socket.user._id,
            text: messagePayload.content,
          },
        });

        // 4. Query memory + recent chat history
        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            topK: 3,
            metadata: { userId: socket.user._id, chatId: messagePayload.chat },
          }),
          messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        const stm = chatHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `These are the most relevant pieces of information I found in your past conversations:\n${memory
                  .map((item) => item.metadata.text)
                  .join("\n")}`,
              },
            ],
          },
        ];

        // 5. Generate AI response
        const response = await generateResponse([...ltm, ...stm]);

        // Emit AI response to client
        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
          timestamp: new Date().toISOString(),
        });

        // 6. Save AI response to DB
        const responseMessage = await messageModel.create({
          user: socket.user._id,
          content: response,
          chat: messagePayload.chat,
          role: "model",
        });

        // 7. Generate vectors for AI response
        const responseVectors = await safeGenerateVector(response);

        await createMemory({
          vectors: responseVectors,
          messageId: responseMessage._id,
          metadata: {
            chatId: messagePayload.chat,
            userId: socket.user._id,
            text: response,
          },
        });
      } catch (err) {
        console.error("AI generation failed:", err?.message || err);
        socket.emit("ai-response", {
          content:
            "Sorry, I couldn't generate a response right now. Please try again.",
          chat: messagePayload.chat,
          timestamp: new Date().toISOString(),
          error: true,
        });
      }
    });
  });
}

module.exports = initSocketServer;
