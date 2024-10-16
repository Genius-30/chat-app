import Router from "express";
import {
  addGroupMember,
  createGroupChat,
  fetchChats,
  removeGroupMember,
  renameGroupChat,
  toggleChat,
} from "../controllers/chat.controller.js";
import upload from "../middleware/multer.js";
import verifyJWT from "../middleware/auth.js";

const router = Router();

router.route("/toggle").post(verifyJWT, toggleChat);
router.route("/fetch").get(verifyJWT, fetchChats);
router
  .route("/group/create")
  .post(verifyJWT, upload.single("avatar"), createGroupChat);
router.route("/group/rename").post(verifyJWT, renameGroupChat);
router.route("/group/add").post(verifyJWT, addGroupMember);
router.route("/group/remove").post(verifyJWT, removeGroupMember);

export const chatRouter = router;
