import { number, object, string } from "yup";
import { NotificationType } from "../typings/types";

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
