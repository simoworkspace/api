import { number, object, string } from "yup";
import { TeamPermissions } from "../typings/types";

export const createTeamValidator = object({
    name: string()
        .required("\"name\" property is missing")
        .min(3, "Team name must be greater than or equal to 3")
        .max(15, "Team name must be less than or equal to 15")
        .required("\"name\" property is missing"),
    avatar_url: string()
        .required("\"avatar_url\" property is missing")
        .url("Invalid avatar URL"),
    description: string()
        .min(5, "Description must be greater than or equal to 5")
        .max(50, "Description must be less than or equal to 50"),
})
    .required("Empty team data received")
    .noUnknown("Unknown property found")
    .strict();

export const updateTeamValidator = object({
    name: string()
        .min(3, "Team name must be greater than or equal to 3")
        .max(15, "Team name must be less than or equal to 15"),
    avatar_url: string().url("Invalid avatar URL"),
    description: string()
        .min(5, "Description must be greater than or equal to 5")
        .max(50, "Description must be less than or equal to 50"),
    vanity_url_code: string()
        .min(1, "Invite code can't be empty")
        .max(16, "Vanity URL maximum length is 16 characters"),
    banner_url: string().url("Banner URL not well formed"),
})
    .test(
        "at-least-one-key",
        "At least one property must be provided",
        (obj) => {
            return Object.keys(obj).length > 0;
        }
    )
    .noUnknown("Unknown property found")
    .strict()
    .required("Empty team data received");

export const updateTeamMemberValidator = object({
    permission: number()
        .oneOf(
            [TeamPermissions.Administrator, TeamPermissions.ReadOnly],
            "Invalid permission type"
        )
        .required("\"permission\" property is missing"),
})
    .noUnknown("Unknown property found")
    .strict();
