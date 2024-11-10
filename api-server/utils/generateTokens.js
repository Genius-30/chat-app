import jwt from "jsonwebtoken";

export const generateAccessToken = async (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
      // phoneNumber: user.phoneNumber,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = async (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
      // phoneNumber: user.phoneNumber,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
