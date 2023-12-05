import { array, boolean, number, object, string } from "yup";
import { NotificationType, TeamPermissions } from "../typings/types";

const idPattern = /^\d{16,21}$/;

export const createNotificationValidator = object({
    content: string().required(),
    type: number()
        .oneOf([
            NotificationType.ApprovedBot,
            NotificationType.Comment,
            NotificationType.Mixed,
            NotificationType.RefusedBot,
        ])
        .required(),
    url: string().url(),
})
    .strict()
    .required()
    .noUnknown();

export const createTeamValidator = object({
    name: string().required().min(3).max(15).required(),
    avatar_url: string().required(),
    description: string().min(5).max(50),
    bots_id: array(string().matches(idPattern)).max(3),
})
    .required()
    .noUnknown();

export const updateTeamValidator = object({
    name: string().min(3).max(15),
    avatar_url: string().url(),
    description: string().min(5).max(50),
})
    .test("at-least-one-key", "You must pass at least one key", (obj) => {
        return Object.keys(obj).length > 0;
    })
    .noUnknown()
    .strict();

export const updateUserValidator = object({
    bio: string().max(200).min(1).nullable(),
    notifications_viewed: boolean(),
    banner_url: string().url().nullable(),
})
    .noUnknown()
    .strict()
    .test("at-least-one-key", "You must pass at least one key", (object) => {
        return Object.keys(object).length > 0;
    });

export const updateTeamMemberValidator = object({
    permission: number()
        .oneOf([TeamPermissions.Administrator, TeamPermissions.ReadOnly])
        .required(),
}).noUnknown();
