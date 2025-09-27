const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: {
      type: [
        {
          text: { type: String },
          isBot: { type: Boolean, default: false },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const chatModel = mongoose.model("chat", chatSchema);

module.exports = chatModel;
