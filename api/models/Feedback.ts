import { Schema, model } from "mongoose";
import type { FeedbackStructure } from "../typings/types";

const rawFeedbackSchema = new Schema<FeedbackStructure>(
    {
        stars: {
            type: Number,
            required: true,
        },
        author_id: String,
        posted_at: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 500,
        },
        target_bot_id: {
            type: String,
            required: true,
        },
        edited: Boolean,
        reply_message: {
            content: String,
            posted_at: String,
            edited: Boolean,
        },
    },
    { versionKey: false }
);

export const feedbackSchema = model("Feedbacks", rawFeedbackSchema);
