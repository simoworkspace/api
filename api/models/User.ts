import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { UserStructure } from "../typings/types";

const rawUserSchema = new Schema<UserStructure>({
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
        default: "",
    },
    notifications_viewed: {
        type: Boolean,
        default: true,
    },
    banner_url: {
        type: String,
        default: null,
    },
});

export const userSchema = model(MODELS_NAME.Users, rawUserSchema);
