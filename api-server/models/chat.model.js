import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    avatar: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/012/574/694/small/people-linear-icon-squad-illustration-team-pictogram-group-logo-icon-illustration-vector.jpg",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
