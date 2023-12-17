import { Schema, model } from "mongoose";
import { PremiumType, type UserStructure } from "../typings/types";

const rawUserSchema = new Schema<UserStructure>(
    {
        _id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        notifications: {
            type: Map,
            of: Object,
            default: new Map(),
        },
        bio: String,
        notifications_viewed: {
            type: Boolean,
            default: true,
        },
        banner_url: String,
        flags: {
            type: Number,
            required: true,
            default: 0,
        },
        premium_type: {
            type: Number,
            default: PremiumType.None,
        },
    },
    { versionKey: false }
);

export const userModel = model("User", rawUserSchema);
