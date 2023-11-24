import { object, string, array, boolean, number } from "yup";

const idPattern = /^\d{16,21}$/;

const voteValidator = object({
    votes: number().required(),
    user: string().matches(idPattern).required(),
    last_vote: string().required(),
})
    .strict()
    .required()
    .noUnknown();

export const botSchemaValidator = object({
    name: string().required(),
    avatar: string().required(),
    invite_url: string().url().required(),
    website_url: string().url(),
    support_server: string().matches(
        /^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i
    ),
    source_code: string().url(),
    short_description: string().min(50).max(80),
    long_description: string().min(200).max(2048),
    prefixes: array(string().max(6)).max(5).required(),
    created_at: string().required(),
    verified: boolean().required(),
    tags: array(string()).max(5).required(),
    approved: boolean().required(),
    votes: array(voteValidator),
    banner_url: string().max(200).min(1),
    vote_message: string().min(5).max(30),
})
    .strict()
    .required()
    .noUnknown();

export const patchBotValidator = object({
    name: string(),
    avatar: string(),
    invite_url: string(),
    website_url: string(),
    support_server: string().matches(
        /^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i
    ),
    source_code: string().url(),
    short_description: string().min(50).max(80),
    long_description: string().max(2048),
    prefixes: array(string().max(6)).max(5),
    owner_id: string().matches(idPattern),
    verified: boolean(),
    tags: array(string()).max(5),
    votes: array(voteValidator),
    banner_url: string().max(200).min(1),
    team_id: string(),
    vote_message: string().min(5).max(30),
})
    .strict()
    .required()
    .noUnknown();
