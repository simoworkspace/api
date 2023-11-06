import { array, boolean, number, object, string } from "yup";
import { NotificationType, TeamPermissions } from "../typings/types";

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
}).strict();

export const createTeamValidator = object({
    members: array(
        object({
            id: string()
                .matches(/^\d{16,21}$/)
                .required(),
            permission: number()
                .oneOf([
                    TeamPermissions.Administrator,
                    TeamPermissions.ReadOnly,
                ])
                .required(),
            owner: boolean(),
        })
    )
        .required()
        .test(
            "one-owner",
            "Some member of the team must be the owner",
            (members) => members.filter((member) => member.owner).length === 1
        ),
    name: string().required().min(3).max(15).required(),
    avatar_url: string().required(),
    description: string().min(5).max(50),
    bot_id: string()
        .matches(/^\d{16,21}$/)
        .required(),
}).required();

export const updateTeamValidator = object({
    name: string().min(3).max(15),
    avatar_url: string(),
    description: string().min(5).max(50),
    members: array(
        object({
            id: string().matches(/^\d{16,21}$/),
            permission: number().oneOf([
                TeamPermissions.Administrator,
                TeamPermissions.ReadOnly,
            ]),
            owner: boolean(),
        })
    ).test(
        "one-owner",
        "Some member of the team must be the owner",
        (members) =>
            members && members.filter((member) => member.owner).length === 1
    ),
})
    .test("at-least-one-key", "You must pass at least one key", (obj) => {
        return Object.keys(obj).length > 0;
    })
    .noUnknown()
    .strict();
