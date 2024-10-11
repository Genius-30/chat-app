import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

// export const createChat = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         message: "Please provide a user ID to create a chat",
//       });
//     }

//     let exisitngChat = await Chat.findOne({
//       isGroudChat: false,
//       users: { $all: [req.user.userId, userId] },
//       // $and: [
//       //   { users: { $elemMatch: { $eq: req.user.userId } } },
//       //   { users: { $elemMatch: { $eq: userId } } },
//       // ],
//     })
//       .populate("users", "-refreshToken")
//       .populate("latestMessage");

//     exisitngChat = await User.populate(exisitngChat, {
//       path: "latestMessage.sender",
//       select: "-refreshToken",
//     });

//     if (exisitngChat) {
//       return res
//         .status(200)
//         .json({ message: "Chat already exists", chat: exisitngChat });
//     }

//     const newChat = await Chat.create({
//       chatName: "sender",
//       users: [req.user.userId, userId],
//       isGroupChat: false,
//     });

//     const createdChat = await Chat.findById(newChat._id).populate(
//       "users",
//       "-refreshToken"
//     );

//     return res
//       .status(201)
//       .json({ message: "Chat created successfully!", createdChat });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: error.message });
//   }
// };

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
      return res
        .status(200)
        .json({
          message: "Chat removed successfully",
          chatId: existingChat._id,
        });
    }

    const newChat = await Chat.create({
      chatName: "sender",
      users: [req.user.userId, userId],
      isGroupChat: false,
    });

    const createdChat = await Chat.findById(newChat._id).populate(
      "users",
      "-refreshToken"
    );

    return res
      .status(201)
      .json({ message: "Chat created successfully!", createdChat });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chats = await Chat.find({ users: { $all: [userId] } }).populate(
      "users",
      "-refreshToken"
    );

    if (!chats) {
      return res.status(404).json({ message: "Chats not found" });
    }

    return res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate("users")
      .populate("messages");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const addMessageToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, sender } = req.body;
    const media = req.file;

    if (!text && !media) {
      return res
        .status(400)
        .json({ message: "Message text or media is required" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = new Message({
      sender,
      text: text || "",
      media: media ? media.buffer : null,
      isMixed: !!(text && media),
    });

    chat.messages.push(newMessage);
    await chat.save();

    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
