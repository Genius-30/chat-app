import Router from "express";
import {
  addGroupMember,
  createGroupChat,
  fetchChats,
  getChat,
  removeGroupMember,
  renameGroupChat,
  sendMessage,
  toggleChat,
} from "../controllers/chat.controller.js";
import upload from "../middleware/multer.js";
import verifyJWT from "../middleware/auth.js";

const router = Router();

router.use(verifyJWT);

router.route("/:chatId/messages").get(getChat);
router.route("/toggle").post(toggleChat);
router.route("/").get(fetchChats);
router.route("/group/create").post(upload.single("avatar"), createGroupChat);
router.route("/group/rename").post(renameGroupChat);
router.route("/group/add").post(addGroupMember);
router.route("/group/remove").post(removeGroupMember);
router.route("/:chatId/send-message").post(upload.array("files"), sendMessage);

export const chatRouter = router;