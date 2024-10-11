import Router from "express";
import { getChats, toggleChat } from "../controllers/chat.controller.js";
import verifyJWT from "../middleware/auth.js";

const router = Router();

router.route("/toggle").post(verifyJWT, toggleChat);
router.route("/fetch").get(verifyJWT, getChats);

export const chatRouter = router;
