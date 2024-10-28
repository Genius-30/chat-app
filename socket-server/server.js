import { Server } from "socket.io";
import { configDotenv } from "dotenv";
configDotenv();

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined room ${chatId}`);
    });

    socket.on("sendMessage", (message) => {
      // Broadcast the message to other users in the room
      socket.broadcast.to(message.chatId).emit("message", message);
    });

    socket.on("leaveRoom", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getSocketInstance = () => io;
