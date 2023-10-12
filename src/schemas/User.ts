import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { UserStructure } from "../types/types";

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
});

export const userSchema = model(MODELS_NAME.Users, rawUserSchema);
