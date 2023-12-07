import { Schema, model } from "mongoose";
import type { UserStructure } from "../typings/types";

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
        bio: {
            type: String,
            default: null,
        },
        notifications_viewed: {
            type: Boolean,
            default: true,
        },
        banner_url: {
            type: String,
            default: null,
        },
        flags: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { versionKey: false }
);

export const userModel = model("User", rawUserSchema);
