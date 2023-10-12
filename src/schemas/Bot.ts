import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { BotStructure, VoteStructure } from "../types/types";

const rawBotSchema = new Schema<BotStructure>({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    invite_url: {
        type: String,
        required: true,
    },
    website_url: String,
    support_server: String,
    source_code: String,
    short_description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 80,
    },
    long_description: {
        type: String,
        required: true,
        minlength: 200,
        maxlength: 2048,
    },
    prefixes: {
        type: [String],
        required: true,
    },
    owners: {
        type: [String],
        required: true,
    },
    created_at: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    approved: {
        type: Boolean,
        required: true,
    },
    votes: {
        type: [Object] as unknown as VoteStructure[],
        required: true,
        default: [],
    },
});

export const botSchema = model(MODELS_NAME.Bots, rawBotSchema);
