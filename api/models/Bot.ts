import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { BotStructure } from "../typings/types";

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
    owner_id: {
        type: String,
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
    api_key: {
        type: String,
        required: false,
    },
    votes: {
        type: [Object],
        required: true,
        default: [],
    },
    total_votes: {
        type: Number,
        required: true,
        default: 0,
    },
    banner_url: {
        type: String,
        default: null,
    },
    team_id: String,
});

export const botSchema = model(MODELS_NAME.Bots, rawBotSchema);
