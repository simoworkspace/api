import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Response } from "express";
import { USER } from "../../utils/errors.json";
import { createNotificationValidator } from "../../validators/user";
import { NotificationBody } from "../../typings/types";

export const createNotification = async (
    res: Response,
    userId: string,
    data: Omit<NotificationBody, "sent_at">
) => {
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const validation = await createNotificationValidator
        .validate(data)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const notificationsId = [...user.notifications.keys()];
    const notificationId =
        notificationsId.length < 1
            ? "1"
            : `${Math.max(...notificationsId.map(Number)) + 1}`;

    user.notifications.set(notificationId, {
        ...data,
        sent_at: new Date().toISOString(),
    });

    await user.save();
};
