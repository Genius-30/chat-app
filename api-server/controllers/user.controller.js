import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import sendVerificationEmail from "../utils/sendEmail.js";

// Cookie Options
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  domain:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : undefined,
};

// Signup User
export const signup = async (req, res) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email`;
  try {
    const { username, email, password } = req.body;
    const avatar = req.file?.path;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    let verifyCode = Math.floor(100000 + Math.random() * 900000);
    let verifyCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

    let avatarUploadResult;
    if (avatar) {
      avatarUploadResult = await uploadOnCloudinary(avatar);
    }

    if (existingUser) {
      if (existingUser.isVerified) {
        // If user already exists and is verified, return an error
        return res.status(400).json({
          message: "User already exists and is verified. Please log in.",
        });
      } else {
        // If user exists but is not verified, update the user details
        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = verifyCodeExpiry;
        existingUser.password = password;
        if (avatarUploadResult) {
          existingUser.avatar = avatarUploadResult.secure_url;
        }

        await existingUser.save();

        await sendVerificationEmail(
          existingUser.username,
          existingUser.email,
          verificationLink,
          verifyCode
        );

        const accessToken = await generateAccessToken(existingUser);
        const refreshToken = await generateRefreshToken(existingUser);

        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        res.cookie("refreshToken", refreshToken, options);
        return res.status(200).json({
          user: existingUser,
          accessToken,
        });
      }
    } else {
      // If user does not exist, create a new user
      const newUser = await User.create({
        username,
        email,
        password,
        avatar: avatarUploadResult?.secure_url,
        verifyCode,
        verifyCodeExpiry,
      });

      await sendVerificationEmail(
        newUser.username,
        newUser.email,
        verificationLink,
        verifyCode
      );

      const accessToken = await generateAccessToken(newUser);
      const refreshToken = await generateRefreshToken(newUser);

      newUser.refreshToken = refreshToken;
      await newUser.save();

      res.cookie("refreshToken", refreshToken, options);
      return res.status(201).json({ user: newUser, accessToken });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login User
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
    } else if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please check your email for the verification link.",
      });
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

// check username availability
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({
      username,
    });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "Username already exists" });
    }

    return res.status(200).json({ message: "Username available" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      email: req.user.email,
      verifyCode: code,
      verifyCodeExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verifyCode = "";
    user.verifyCodeExpiry = Date.now();

    await user.save();

    return res.status(200).json({ message: "Email verified" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// update user details
export const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const avatar = req.file?.buffer;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new username is already taken
    if (username && user.username !== username) {
      const existingUser = await User.findOne({ username });

      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    if (email && user.email !== email) user.email = email;

    const defaultAvatar =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    if (avatar && user.avatar !== avatar) {
      if (user.avatar !== defaultAvatar) {
        await deleteFromCloudinary(user.avatar);
      }
      const avatarUploadResult = await uploadOnCloudinary(avatar);
      user.avatar = avatarUploadResult.secure_url;
    }

    await user.save();

    return res.status(200).json({ message: "User updated", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Resend Verification Email
export const resendVerificationEmail = async (req, res) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email`;

  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    let verifyCode = Math.floor(100000 + Math.random() * 900000);
    let verifyCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = verifyCodeExpiry;

    await sendVerificationEmail(
      user.username,
      user.email,
      verificationLink,
      verifyCode
    );

    await user.save();

    return res.status(200).json({ message: "Verification email sent" });
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
          ...user,
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
