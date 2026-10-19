import mongoose, { mongo } from "mongoose";

const TweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.types.ObjectId,
        ref: "User"
    }

}, {timestamps: true})

export const Tweet = mongoose.model("Tweet", TweetSchema)