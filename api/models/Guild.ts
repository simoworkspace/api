import { Schema, model } from "mongoose";
import { MODELS_NAME } from "../../constants.json";
import type { GuildStructure } from "../typings/types";

const rawGuildSchema = new Schema<GuildStructure>({
    _id: {
        type: String,
        required: true,
    },
    verification_channel_id: {
        type: String,
        required: true,
    },
    logs_channel_id: {
        type: String,
        required: true,
    },
    addbot_channel_id: String,
    owners: {
        type: [String],
        required: true,
    },
});

export const guildSchema = model(MODELS_NAME.Guilds, rawGuildSchema);
