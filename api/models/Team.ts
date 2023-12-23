import { Schema, model } from "mongoose";
import type { Team } from "../typings/types";

const rawTeamSchema = new Schema<Team>(
    {
        bots_id: { type: [String], required: true },
        description: String,
        avatar_url: {
            type: String,
            required: true,
        },
        name: { type: String, required: true },
        invite_code: String,
        id: { type: String, required: true },
        members: {
            type: [
                {
                    id: String,
                    permission: Number,
                    _id: false,
                    joined_at: {
                        type: String,
                        default: new Date().toISOString(),
                    },
                },
            ],
            default: [],
        },
        vanity_url: Object,
        created_at: {
            type: String,
            default: new Date().toISOString(),
        },
        banner_url: String,
    },
    { versionKey: false }
);

export const teamModel = model("teams", rawTeamSchema);
