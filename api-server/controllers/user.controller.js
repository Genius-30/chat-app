import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const avatar = req.file?.path;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email, username });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let avatarUploadResult;
    if (avatar) {
      avatarUploadResult = await uploadOnCloudinary(avatar);
    }

    const newUser = await User.create({
      username,
      email,
      password,
      avatar: avatarUploadResult && avatarUploadResult?.secure_url,
    });

    const user = await User.findById(newUser._id);

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, options);
    return res.status(201).json({ user, accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.cookie("refreshToken", refreshToken, options);
    return res.status(201).json({ user: userWithoutPassword, accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fetch Current User
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Logout Current User
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.refreshToken = "";
    await user.save();

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Search Users
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.search
      ? {
          username: { $regex: req.query.search, $options: "i" },
        }
      : {};

    const users = await User.find({
      ...query,
      _id: { $ne: req.user.userId },
    }).select("-refreshToken -email");

    return res.status(200).json(users || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
