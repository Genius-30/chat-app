import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    text: {
      type: String,
      default: "",
    },

    media: {
      type: mongoose.Schema.Types.Mixed,
    },

    isMixed: {
      type: Boolean,
      default: false,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timeStamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
