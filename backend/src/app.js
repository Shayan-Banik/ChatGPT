const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

/* Routes */
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/* Enable CORS */
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1)
        return callback(null, true);
      return callback(new Error("CORS error: origin not allowed"));
    },
    credentials: true,
  })
);
/* Middleware */
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
