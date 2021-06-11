const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatroomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Chatroom",
    },
    chatroomName: {
      type: String,
      required: true,
      ref: "Chatroom",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userName: {
      type: String,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: "Message is required!",
    },
    submitted_on: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
