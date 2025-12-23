// controllers/comments.controller.js
import Comment from "../models/comments.model.js";
import BlockedWord from "../models/blocked.model.js";
import User from "../models/users.model.js"; // للـ populate على admin_id


export const getCommentStats = async (req, res) => {
  try {
    const latestLimit = parseInt(req.query.latestLimit) || 5;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    /* ===============================
       Queries (run in parallel)
    =============================== */

    const blockedCountPromise = Comment.countDocuments({ status: "Blocked" });
    const totalCountPromise = Comment.countDocuments({});



    const latestBlockedPromise = Comment.find({ status: "Blocked" })
        .sort({ updatedAt: -1 })
        .limit(latestLimit)
        .select("_id status text username createdAt timestamp")
        .lean();

    const blockedWordsPromise = BlockedWord.find({})
        .select("text source")
        .lean();

    const blockedWordsWithAdminPromise = BlockedWord.find({ source: "admin" })
        .populate({
          path: "admin_id",
          model: User,
          select: "userName email",
        })
        .lean();

    const blockedLast5Promise = Comment.countDocuments({
      status: "Blocked",
      createdAt: { $gte: oneHourAgo },
    });

    const totalLast5Promise = Comment.countDocuments({
      createdAt: { $gte: oneHourAgo },
    });

    /* ===============================
       Execute all promises
    =============================== */

    const [
      blockedCount,
      totalCount,
      latestBlockedRaw,
      blockedWords,
      blockedWordsWithAdmin,
      blockedLast5,
      totalLast5,
    ] = await Promise.all([
      blockedCountPromise,
      totalCountPromise,
      latestBlockedPromise,
      blockedWordsPromise,
      blockedWordsWithAdminPromise,
      blockedLast5Promise,
      totalLast5Promise,
    ]);

    /* ===============================
       Enrich latestBlocked with blockedBy
    =============================== */

    const latestBlocked = latestBlockedRaw.map((comment) => {
      // console.log("The comment is  :" , comment)
      const textLower = comment.text.toLowerCase();
      // console.log("The textLower is  :" , textLower)
      // console.log("blockedWords is: ", blockedWords)
      const matchedWord = blockedWords.find((word) =>
          textLower.includes(word.text)
      );
      // console.log("The matchedWord is  :" , matchedWord)

      let blockedBy = "system";
      if (matchedWord && matchedWord.source === "admin") {
        blockedBy = "admin";
      }

      return {  
        id: comment._id,
        text: comment.text,
        userName: comment.username,
        status: comment.status,
        blockedBy,
        timestamp: comment.createdAt || new Date(comment.timestamp),
      };
    });

    /* ===============================
       Percentages
    =============================== */

    const blockedPercentage =
        totalCount === 0 ? 0 : Math.round((blockedCount / totalCount) * 100);

    const blockedPercentageLast5 =
        totalLast5 === 0 ? 0 : Math.round((blockedLast5 / totalLast5) * 100);

    /* ===============================
       Response
    =============================== */

    return res.json({
      blockedCount,
      totalCount,
      blockedPercentage,
      latestBlocked,
      blockedWordsWithAdmin,
      blockedLast5,
      totalLast5,
      blockedPercentageLast5,
    });
  } catch (error) {
    console.error("getCommentStats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getComments = async (req, res) => {
  try {
    // Load blocked words once
    const blockedWords = await BlockedWord.find({}).lean();

    // Load all comments once
    const allCommentsRaw = await Comment.find({})
        .sort({ createdAt: -1 })
        .lean();

    const allComments = [];
    const blockedComments = [];
    const normalComments = [];

    for (const comment of allCommentsRaw) {
      let blockedBy = null;

      if (comment.status === "Blocked") {
        const textLower = comment.text.toLowerCase();

        const matchedWord = blockedWords.find((word) =>
            textLower.includes(word.text)
        );

        blockedBy =
            matchedWord && matchedWord.source === "admin"
                ? "admin"
                : "system";
      }

      const formattedComment = {
        id: comment._id.toString(),
        text: comment.text,
        userName: comment.username,
        status: comment.status === "Blocked" ? "blocked" : "normal",
        blockedBy,
        timestamp: comment.createdAt,
      };

      allComments.push(formattedComment);

      if (formattedComment.status === "blocked") {
        blockedComments.push(formattedComment);
      } else {
        normalComments.push(formattedComment);
      }
    }

    return res.json({
      allComments,
      blockedComments,
      normalComments,
      totalBlocked: blockedComments.length,
      latestBlocked: blockedComments.slice(0, 5),
    });
  } catch (error) {
    console.error("getComments error:", error);
    return res.status(500).json({ message: "Failed to load comments" });
  }
};