import express from "express";
import cors from "cors";
import dbConnect from "./dbConnect.js";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.route.js";
import { chatRouter } from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect to MongoDB
dbConnect();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
