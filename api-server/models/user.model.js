import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  // phoneNumber: {
  //   type: String,
  //   required: true, // Make phone number required
  //   unique: true, // Ensure phone number is unique (optional)
  //   trim: true, // Remove extra spaces
  // },
  avatar: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  refreshToken: { type: String, select: false },

  // phoneVerifyCode: { type: String, select: false },
  // phoneVerifyCodeExpiry: { type: Date, select: false },
  // isPhoneVerified: { type: Boolean, default: false },

  verifyCode: { type: String, select: false },
  verifyCodeExpiry: { type: Date, select: false },
  isVerified: { type: Boolean, default: false },
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
