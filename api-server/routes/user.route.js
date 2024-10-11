import { Router } from "express";
import {
  signup,
  login,
  getUser,
  logout,
  searchUsers,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.js";
import verifyJWT from "../middleware/auth.js";

const router = Router();

router.route("/signup").post(upload.single("avatar"), signup);
router.route("/login").post(login);
router.route("/").get(verifyJWT, getUser);
router.route("/logout").get(verifyJWT, logout);
router.route("/search").get(verifyJWT, searchUsers);

export const userRouter = router;
