import {Router} from "express";

import { postContent, shareContent, deleteContent, getContent, searchContent } from "../controllers/contentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { login, register } from "../controllers/authController.js";




const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/add-content",authMiddleware, postContent);
router.get("/get-content", authMiddleware, getContent);
router.get("/search", authMiddleware, searchContent);
router.delete("/delete/:contentId", authMiddleware, deleteContent);
router.post("/share-content/:userId", authMiddleware, shareContent);

export default router;