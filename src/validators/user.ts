import { object, string } from "yup";

export const createNotificationValidator = object({
    content: string().required(),
}).strict();
