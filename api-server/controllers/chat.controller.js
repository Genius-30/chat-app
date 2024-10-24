import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import sharp from "sharp";

// create or remove a chat
export const toggleChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Please provide a user ID to create or remove a chat",
      });
    }

    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user.userId, userId] },
    });

    if (existingChat) {
      await Chat.findByIdAndDelete(existingChat._id);
      return res.status(200).json({
        message: "Chat removed successfully",
        chat: { chatId: existingChat._id },
      });
    }

    const newChat = await Chat.create({
      chatName: "sender",
      users: [req.user.userId, userId],
      isGroupChat: false,
    });

    const createdChat = await Chat.findById(newChat._id).populate("users");

    const otherUser = createdChat.users.filter(
      (user) => user._id.toString() !== req.user.userId.toString()
    );

    const { users, ...chatWithoutUsers } = createdChat._doc;

    return res.status(201).json({
      message: "Chat created successfully!",
      chat: { ...chatWithoutUsers, users: otherUser },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// fetch all chats
export const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user.userId } },
    })
      .populate("users", "username avatar _id")
      .populate("groupAdmin", "username avatar _id")
      .sort({ updatedAt: -1 });

    if (!chats) {
      return res.status(404).json({ message: "Chats not found" });
    }

    const modifiedChats = chats.map((chat) => {
      const otherUsers = chat.users.filter(
        (user) => user._id.toString() !== req.user.userId.toString()
      );
      return {
        _id: chat._id,
        chatName: chat.isGroupChat ? chat.chatName : otherUsers[0].username,
        isGroupChat: chat.isGroupChat,
        users: otherUsers,
        groupAdmin: chat.groupAdmin,
        avatar: chat.isGroupChat ? chat.avatar : otherUsers[0].avatar,
        latestMessage: {
          content: chat.latestMessage.content,
          sender: chat.latestMessage.sender,
          status: chat.latestMessage.status,
          timestamp: chat.latestMessage.timestamp,
        },
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });

    return res.status(200).json(modifiedChats);
  } catch (error) {
    console.log("Error fetching chats:", error);
    return res.status(500).json({ message: error.message });
  }
};

// create a group chat
export const createGroupChat = async (req, res) => {
  try {
    let { groupName, members } = req.body;
    members = JSON.parse(members);

    const avatar = req.file?.path;

    if (!groupName || !members) {
      return res
        .status(400)
        .json({ message: "Please provide a group name and members" });
    }

    members.push(req.user.userId);

    if (members.length < 2) {
      return res
        .status(400)
        .json({ message: "Please add at least two members in group" });
    }

    let avatarUploadResult;
    if (avatar) {
      avatarUploadResult = await uploadOnCloudinary(avatar);
    }

    const newGroupChat = await Chat.create({
      chatName: groupName,
      users: members,
      isGroupChat: true,
      groupAdmin: req.user.userId,
      avatar: avatarUploadResult && avatarUploadResult.secure_url,
    });

    const createdGroupChat = await Chat.findById(newGroupChat._id).populate(
      "users"
    );
    // .populate("groudAdmin");

    return res.status(201).json({
      message: "Group chat created successfully!",
      chat: createdGroupChat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// rename a group chat
export const renameGroupChat = async (req, res) => {
  try {
    const { groupId, groupName } = req.body;

    if (!groupId || !groupName) {
      return res
        .status(400)
        .json({ message: "Please provide a group ID and name" });
    }

    const updatedGroup = await Chat.findByIdAndUpdate(
      groupId,
      {
        chatName: groupName,
      },
      { new: true }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.status(200).json(updatedGroup);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// add a member to a group chat
export const addGroupMember = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res
      .status(400)
      .json({ message: "Please provide a group ID and user ID" });
  }
  try {
    const group = await Chat.findById(groupId)
      .populate("users")
      .populate("groupAdmin");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.users.push(userId);
    await group.save();

    return res.status(200).json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// remove a member from a group chat
export const removeGroupMember = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res
      .status(400)
      .json({ message: "Please provide a group ID and user ID" });
  }
  try {
    const group = await Chat.findById(groupId)
      .populate("users")
      .populate("groupAdmin");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.users = group.users.filter((user) => user !== userId);
    await group.save();

    return res.status(200).json(group);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// get a chat with messages
export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await Chat.findById(chatId)
      .populate("users", "_id username avatar")
      .populate("groupAdmin", "_id username avatar");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if the current user is part of the chat
    const isUserPartOfChat = chat.users.some(
      (user) => user._id.toString() === currentUserId.toString()
    );

    // If the current user is not part of the chat, return a forbidden response
    if (!isUserPartOfChat) {
      return res.status(403).json({ message: "Invalid ChatId" });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(20) // Example: limiting to the last 20 messages
      .populate("sender", "username avatar _id");

    // Filter out the current user from the chat's 'users' field
    const otherUsers = chat.users.filter(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    const response = {
      ...chat.toObject(), // Convert mongoose document to a plain object
      users: otherUsers, // Replace 'users' with filtered users
      messages: messages.reverse(), // Reverse the messages to show the latest first
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const files = req.files;

    if (!text && (!files || files.length === 0)) {
      return res
        .status(400)
        .json({ message: "Message text or files is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    let uploadedFiles = [];
    if (files && files.length > 0) {
      uploadedFiles = await Promise.all(
        files.map(async (file) => {
          let fileBuffer = file.buffer;

          // If the file is an image, compress and resize it using sharp
          if (file.mimetype.startsWith("image/")) {
            fileBuffer = await sharp(fileBuffer)
              .resize({ width: 800, height: 800, fit: "inside" })
              .webp({ quality: 80 })
              .toBuffer();
          }

          // Upload the file (image, video, PDF, etc.) to Cloudinary
          const result = await uploadOnCloudinary(fileBuffer);

          if (result) {
            return {
              filename: file.originalname,
              path: result.secure_url,
              mimetype: file.mimetype,
            };
          }
        })
      );
    }

    const messageData = {
      sender: req.user.userId,
      text: text || "",
      files: uploadedFiles,
      isMixed: !!(text && uploadedFiles.length > 0),
      chat: chat._id,
    };

    const newMessage = await Message.create(messageData);

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar _id")
      .exec();

    // Send the populated message immediately
    res.status(201).json(populatedMessage);

    const latestMessageData = {
      content: text || "Sent a file", // Use a placeholder if only media is sent
      sender: req.user.userId,
      status: "sent",
      timestamp: new Date(),
    };

    // Update the chat's lastMessage asynchronously
    await Chat.findByIdAndUpdate(chatId, { latestMessage: latestMessageData });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: error.message });
  }
};
