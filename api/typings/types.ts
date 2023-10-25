/**
 * See https://discord.com/developers/docs/reference#snowflakes
 */
export type Snowflake = string;

/**
 * Represents the structure in the bot schema
 */
export interface BotStructure {
    _id: Snowflake;
    name: string;
    avatar: string;
    invite_url: string;
    website_url: string;
    support_server: string;
    source_code: string;
    short_description: string;
    long_description: string;
    prefixes: string[];
    owners: Snowflake[];
    created_at: string;
    verified: boolean;
    tags: string[];
    approved: boolean;
    votes: VoteStructure[];
}

/**
 * Represents the structure in the user schema
 */
export interface UserStructure {
    _id: Snowflake;
    username: string;
    avatar: string;
    api_key?: string;
    notifications: Map<string, NotificationBody>;
}

/**
 * Base for user payloads (Don't use this as user payload)
 */
export interface DiscordUserStructure extends Omit<UserStructure, "_id"> {
    id: Snowflake;
}

/**
 * Represents the structure in the vote schema
 */
export interface VoteStructure {
    votes: number;
    user: Snowflake;
    last_vote: string;
}

/**
 * Represents the structure in the guild schema
 */
export interface GuildStructure {
    _id: Snowflake;
    verification_channel_id: Snowflake;
    logs_channel_id: Snowflake;
    addbot_channel_id: Snowflake | undefined;
    owners: Snowflake[];
}

/**
 * Represents the structure in the feedback schema
 */
export interface FeedbackStructure {
    author: DiscordUserStructure;
    stars: number;
    posted_at: string;
    content: string;
    target_bot: Snowflake;
    edited?: boolean;
}

/**
 * Represents scopes used in GET-AUTH function
 */
export enum APIScopes {
    Identify = "identify",
    Guilds = "guilds",
}

export interface NotificationBody {
    content: string;
    sent_at: string;
    type: NotificationType;
    url?: string;
}

export enum NotificationType {
    Comment,
    ApprovedBot,
    RefusedBot,
    Mixed,
}
