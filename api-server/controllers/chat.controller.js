import Chat from "../models/chat.model.js";

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
        chatId: existingChat._id,
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
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user.userId } },
    }).populate("users");
    //   .populate("latestMessage")
    //   .sort({ updatedAt: -1 });

    // chats = await User.populate(chats, {
    //   path: "latestMessage.sender",
    //   select: "username avatar _id",
    // });

    if (!chats) {
      return res.status(404).json({ message: "Chats not found" });
    }

    const modifiedChats = chats.map((chat) => {
      const otherUsers = chat.users.filter(
        (user) => user._id.toString() !== req.user.userId.toString()
      );
      return {
        ...chat._doc,
        users: otherUsers,
      };
    });

    return res.status(200).json(modifiedChats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// create a group chat
export const createGroupChat = async (req, res) => {
  try {
    const { groupName, members } = req.body;

    if (!groupName || !users) {
      return res
        .status(400)
        .json({ message: "Please provide a group name and users" });
    }

    const users = JSON.parse(members);

    if (users.length < 2) {
      return res
        .status(400)
        .json({ message: "Please provide at least two users" });
    }

    const newGroupChat = await Chat.create({
      chatName: groupName,
      users: [...users, req.user.userId],
      isGroupChat: true,
      groupAdmin: req.user.userId,
    });

    const createdGroupChat = await Chat.findById(newGroupChat._id)
      .populate("users")
      .populate("groudAdmin");

    return res
      .status(201)
      .json({ message: "Group chat created successfully!", createdGroupChat });
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

// get a chat
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
    return res.status(500).json({ message: error.message });
  }
};
