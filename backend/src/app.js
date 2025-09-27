const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

/* Routes */
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/* Enable CORS */
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://chatbuddy-sl9g.onrender.com" ];
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
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files

/* Using Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

/* Catch-all: send frontend index.html for any unknown route */
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
