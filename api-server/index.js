import { Server } from "socket.io";
import { chatRouter } from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { userRouter } from "./routes/user.route.js";

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

  socket.on("register-user", async ({ userId, username }) => {
    connectedUsers.set(userId, { socketId: socket.id, status: "online" });
    console.log(`User registered: ${username} with socket ID ${socket.id}`);

    io.emit("userStatus", { userId, status: "online" });
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

  socket.on("typing", ({ chatId, userId, username }) => {
    socket.to(chatId).emit("typing", { userId, username });
  });

  socket.on("stop typing", ({ chatId, userId, username }) => {
    socket.to(chatId).emit("stop typing", { userId, username });
  });

  // Leave a chat room
  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    connectedUsers.forEach(async (id, userId) => {
      if (id === socket.id) {
        connectedUsers.delete(userId);

        io.emit("userStatus", {
          userId,
          status: "offline",
          lastSeen: new Date(),
        });
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
