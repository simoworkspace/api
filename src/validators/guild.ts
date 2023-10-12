import { array, object, string } from "yup";

const idPattern = /^\d{16,21}$/;

export const guildValidator = object({
    _id: string().matches(idPattern).required(),
    verification_channel_id: string().matches(idPattern).required(),
    logs_channel_id: string().matches(idPattern).required(),
    addbot_channel_id: string().matches(idPattern),
    owners: array(string().matches(idPattern).required()).required(),
});

export const patchGuildValidator = object({
    verification_channel_id: string().matches(idPattern),
    logs_channel_id: string().matches(idPattern),
    add_bot_channel_id: string().matches(idPattern),
    owners: array(string().matches(idPattern)),
});
