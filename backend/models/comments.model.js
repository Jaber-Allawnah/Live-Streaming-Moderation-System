import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
        status: {
            type: String,
            required: true,
        },
        text:{
            type:String,
            required: true,
        },
        username:{
            type:String,
            required: true,
        },
        user_id:{
            type:String,
            required: true,
        },
        timestamp:{
            type:Number,
            required: true,
        }
    },
    {
        timestamps: true,
        collection: "test_collection",
    });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;