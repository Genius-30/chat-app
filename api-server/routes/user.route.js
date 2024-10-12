import { Router } from "express";
import {
  signup,
  login,
  getUser,
  logout,
  searchUsers,
  checkUsername,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.js";
import verifyJWT from "../middleware/auth.js";

const router = Router();

router.route("/signup").post(upload.single("avatar"), signup);
router.route("/login").post(login);
router.route("/").get(verifyJWT, getUser);
router.route("/logout").get(verifyJWT, logout);
router.route("/check-username").post(checkUsername);
router.route("/search").get(verifyJWT, searchUsers);
router.route("/verify-email").post(verifyJWT, verifyEmail);
router
  .route("/resend-verification-email")
  .get(verifyJWT, resendVerificationEmail);

export const userRouter = router;
