import { array, boolean, number, object, string } from "yup";
import { NotificationType, TeamPermissions } from "../typings/types";

const idPattern = /^\d{16,21}$/;

export const createNotificationValidator = object({
    content: string().required("\"content\" property is missing"),
    type: number()
        .oneOf(
            [
                NotificationType.ApprovedBot,
                NotificationType.Comment,
                NotificationType.Mixed,
                NotificationType.RefusedBot,
            ],
            "Invalid feedback type"
        )
        .required("\"type\" property is missing"),
    url: string().url("Invalid feedback URL"),
})
    .strict()
    .required("Empty notification data received")
    .noUnknown("Unknown property found");

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
        .min(5, "Description must be grater than or equal to 5")
        .max(50, "Description must be less than or equal to 50"),
    bots_id: array(string().matches(idPattern, "Invalid bot ID")).max(
        3,
        "A team can't have more than 3 bots"
    ),
})
    .required("Empty team data received")
    .noUnknown("Unknown property found");

export const updateTeamValidator = object({
    name: string()
        .min(3, "Team name must be greater than or equal to 3")
        .max(15, "Team name must be less than or equal to 15"),
    avatar_url: string().url("Invalid avatar URL"),
    description: string()
        .min(5, "Description must be grater than or equal to 5")
        .max(50, "Description must be less than or equal to 50"),
    vanity_url_code: string()
        .min(1, "Invite code can't be empty")
        .max(16, "Vanity URL maximum length is 16 characters"),
})
    .test("at-least-one-key", "At least one property must be provided", (obj) => {
        return Object.keys(obj).length > 0;
    })
    .noUnknown("Unknown property found")
    .strict()
    .required("Empty team data received");

export const updateUserValidator = object({
    bio: string().max(200).min(1),
    notifications_viewed: boolean(),
    banner_url: string().url("Invalid banner URL"),
})
    .noUnknown("Unknown property found")
    .strict()
    .test("at-least-one-key", "At least one property must be provided", (object) => {
        return Object.keys(object).length > 0;
    });

export const updateTeamMemberValidator = object({
    permission: number()
        .oneOf(
            [TeamPermissions.Administrator, TeamPermissions.ReadOnly],
            "Invalid permission type"
        )
        .required("\"permission\" property is missing"),
}).noUnknown("Unknown property found");
