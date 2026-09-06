import Comment from "../models/comments.model.js";
import BlockedWord from "../models/blocked.model.js";

export const blockCommentByAdmin = async (req, res) => {
    const { commentId, adminId } = req.body;

    try {
        // 1️⃣ Find comment
        const comment = await Comment.findById(commentId).lean();

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // 2️⃣ Add comment text to blocked list
        const textLower = comment.text.toLowerCase();

        await BlockedWord.findOneAndUpdate(
            { text: textLower },
            {
                text: textLower,
                source: "admin",
                admin_id: adminId,
            },
            { upsert: true }
        );

        // 3️⃣ Update comment status ONLY
        await Comment.updateOne(
            { _id: commentId },
            { $set: { status: "Blocked" } }
        );

        return res.status(200).json({
            message: "Comment blocked successfully",
        });
    } catch (error) {
        console.error("blockCommentByAdmin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
