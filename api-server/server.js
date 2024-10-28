import express from "express";
import cors from "cors";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.route.js";
import { chatRouter } from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import http from "http";
import {
  getSocketInstance,
  initializeSocket,
} from "../socket-server/server.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Middleware to add io instance to every request
app.use((req, res, next) => {
  req.io = getSocketInstance();
  next();
});

// Connect to MongoDB
dbConnect();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
