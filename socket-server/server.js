import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Chat from "../api-server/models/chat.model.js";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for Socket Server");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDb();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Join a specific chat room
  socket.on("joinRoom", async (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  // Handle new messages
  socket.on("sendMessage", async ({ chatId, content, sender }) => {
    try {
      // Save the message to the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      const newMessage = { content, sender, timestamp: new Date() };
      chat.messages.push(newMessage);
      await chat.save();

      io.to(chatId).emit("messageReceived", newMessage);
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
