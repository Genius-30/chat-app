import express from "express";
import cors from "cors";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.route.js";
import { chatRouter } from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Store user in the connected users map
  socket.on("register-user", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Join a chat room
  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  // Send message to a chat room
  socket.on("sendMessage", (message) => {
    socket.to(message.chatId).emit("message", message);
  });

  // Handle video/voice call initiation
  socket.on("call-user", (data) => {
    const receiverSocketId = connectedUsers.get(data.to);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("call-made", {
        offer: data.offer,
        socket: socket.id,
        video: data.video,
      });
      console.log(`Call initiated from ${socket.id} to ${receiverSocketId}`);
    } else {
      console.log(`User ${data.to} is not connected`);
    }
  });

  // Handle answer to a call
  socket.on("make-answer", (data) => {
    const callerSocketId = data.to;
    socket.to(callerSocketId).emit("answer-made", {
      answer: data.answer,
      socket: socket.id,
    });
    console.log(`Answer sent from ${socket.id} to ${callerSocketId}`);
  });

  // Handle call rejection
  socket.on("reject-call", (data) => {
    const callerSocketId = data.to;
    socket.to(callerSocketId).emit("call-rejected", { socket: socket.id });
    console.log(`Call from ${callerSocketId} rejected by ${socket.id}`);
  });

  // Leave a chat room
  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    connectedUsers.forEach((id, userId) => {
      if (id === socket.id) {
        connectedUsers.delete(userId);
      }
    });
    console.log("User disconnected:", socket.id);
  });
});

// Middleware to add io instance to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Express middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Connect to MongoDB
dbConnect();

// API Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
