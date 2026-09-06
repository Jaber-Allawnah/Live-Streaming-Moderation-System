import mongoose from "mongoose";

const blockedWordSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true, // prevents duplicates like "shit" twice
        },
        source: {
            type: String,
            enum: ["system", "admin"],
            default: "system",
        },
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true, collection: 'Blocked_List' }
);

const BlockedWord = mongoose.model("BlockedWord", blockedWordSchema);
export default BlockedWord;
