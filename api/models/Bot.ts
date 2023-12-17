import { Schema, model } from "mongoose";
import type { BotStructure } from "../typings/types";

const rawBotSchema = new Schema<BotStructure>(
    {
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
        },
        long_description: {
            type: String,
            required: true,
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
            default(this) {
                return new Date(
                    Number(this._id) / 4194304 + 1420070400000
                ).toISOString();
            },
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
            default: false,
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
        team_id: String,
        vote_message: String,
        webhook_url: String,
    },
    { versionKey: false }
);

export const botModel = model("bots", rawBotSchema);
