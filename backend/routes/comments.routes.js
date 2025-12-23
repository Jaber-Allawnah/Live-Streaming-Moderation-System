// routes/comments.routes.js
import express from "express";
import {getComments, getCommentStats} from "../controllers/comments.controller.js";
import { blockCommentByAdmin } from "../controllers/blockedComments.controller.js";

const router = express.Router();

// GET /api/comments/stats
router.get("/stats", getCommentStats);
router.get("/comments", getComments);
router.post('/block-comment', blockCommentByAdmin)

export default router;
