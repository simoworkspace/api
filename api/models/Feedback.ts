import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { FeedbackStructure } from "../typings/types";

const rawFeedbackSchema = new Schema<FeedbackStructure>({
    stars: {
        type: Number,
        required: true,
    },
    author: {
        id: String,
        username: String,
        avatar: String,
    },
    posted_at: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 500,
    },
    target_bot: {
        type: String,
        required: true,
    },
    edited: Boolean,
    reply_message: {
        content: String,
        posted_at: String,
        edited: Boolean,
    },
});

export const feedbackSchema = model(MODELS_NAME.Feedbacks, rawFeedbackSchema);
