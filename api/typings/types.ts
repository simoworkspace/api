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
    owner_id: Snowflake;
    created_at: string;
    verified: boolean;
    tags: string[];
    approved: boolean;
    api_key?: string;
    votes: VoteStructure[];
    total_votes: number;
    banner_url: string;
    team_id: string;
    vote_message: string;
}

/**
 * Represents the structure in the user schema
 */
export interface UserStructure {
    _id: Snowflake;
    username: string;
    avatar: string;
    notifications: Map<string, NotificationBody>;
    bio: string;
    team: Team;
    notifications_viewed: boolean;
}

/**
 * The team object of a user
 */
export interface Team {
    /**
     * The members in the team
     */
    members: TeamMember[];
    /**
     * The hash ID of the team
     */
    id: string;
    /**
     * The invite hash of the team
     */
    invite_hash: string;
    /**
     * The name of the team
     */
    name: string;
    /**
     * The avatar URL of the team
     */
    avatar_url: string;
    /**
     * The description of the team (5-100)
     */
    description: string;
    /**
     * The bot ID that belongs to the team
     */
    bot_id: Snowflake;
}

/**
 * The object of the member
 */
export interface TeamMember {
    /**
     * The member's ID
     */
    id: Snowflake;
    /**
     * Permission of the member in the team
     */
    permission: TeamPermissions;
}

/**
 * The permission of the member in a team
 */
export enum TeamPermissions {
    Administrator,
    ReadOnly,
    Owner,
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
    author_id: string;
    stars: number;
    posted_at: string;
    content: string;
    target_bot: Snowflake;
    edited?: boolean;
    reply_message?: {
        content: string;
        posted_at: string;
        edited?: boolean;
    };
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
