import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Videos"
    },
    comment: {
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    },
    likeBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    tweet: {
        type: mongoose.Types.ObjectId,
        ref: "Tweet"
    }
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)