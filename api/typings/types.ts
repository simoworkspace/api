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
    avatar: string | null;
    invite_url: string;
    website_url?: string;
    support_server?: string;
    source_code?: string;
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
    banner_url: string;
    team_id: string;
    vote_message: string | null;
}

/**
 * Represents the structure in the user schema
 */
export interface UserStructure {
    _id: Snowflake;
    username: string;
    avatar: string | null;
    notifications: Map<string, NotificationBody>;
    bio: string | null;
    notifications_viewed: boolean;
    banner_url: string | null;
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
    invite_code: string;
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
    bots_id: Snowflake[];
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
    user_id: Snowflake;
    last_vote: string;
}

/**
 * Represents the structure in the feedback schema
 */
export interface FeedbackStructure {
    author_id: string;
    stars: number;
    posted_at: string;
    content: string;
    target_bot_id: Snowflake;
    edited?: boolean;
    reply_message?: {
        content: string;
        posted_at: string;
        edited?: boolean;
    };
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

export interface AuditLogStructure {
    team_id: string;
    entries: AuditLogEntryStructure[];
}

export interface AuditLogEntryStructure {
    executor_id: Snowflake;
    created_at: string;
    id: string;
    action_type: AuditLogActionType;
    changes: AnyAuditLogChange[];
    target_id: Snowflake | null;
}

export enum AuditLogActionType {
    /**
     * Member was added in a team
     */
    MemberAdd,
    /**
     * Member was removed in a team
     */
    MemberRemove,
    /**
     * Member was updated in a team
     */
    MemberUpdate,

    /**
     * Ownership of a team has been transferred
     */
    TeamOwnershipTransfer,
    /**
     * Team settings were updated
     */
    TeamUpdate,

    /**
     * Bot was added to a team
     */
    BotAdd,
    /**
     * Bot was removed in a team
     */
    BotRemove,

    /**
     * Invite was updated
     */
    InviteUpdate,
}

export type AnyAuditLogChange =
    | AuditLogInviteUpdateChange
    | AuditLogBotAddChange
    | AuditLogBotRemoveChange
    | AuditLogTeamUpdateChange
    | AuditLogMemberAddChange
    | AuditLogMemberRemoveChange
    | AuditLogMemberUpdateChange
    | AuditLogTeamOwnershipTransferChange;

export type AuditLogMemberAddChange = BaseAuditLogChange<never, never>;
export type AuditLogMemberRemoveChange = AuditLogMemberAddChange;

export type AuditLogMemberUpdateChange = BaseAuditLogChange<
    "permission",
    TeamPermissions
>;

export type AuditLogTeamOwnershipTransferChange = BaseAuditLogChange<
    "id",
    Snowflake
>;

export type AuditLogTeamUpdateChange = BaseAuditLogChange<
    "name" | "description" | "avatar_url",
    string
>;

export type AuditLogBotAddChange = BaseAuditLogChange<"bot_id", Snowflake>;
export type AuditLogBotRemoveChange = AuditLogBotAddChange;

export type AuditLogInviteUpdateChange = BaseAuditLogChange<
    "invite_code",
    string
>;

export type BaseAuditLogChange<Key, Data> = {
    changed_key: Key;
    old_data: Data;
    new_data?: Data;
};
