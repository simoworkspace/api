import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../../helpers/errors.json";
import { getUserId } from "../../helpers/getUserId";

export const deleteNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const userId = await getUserId(req.headers);
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { notificationId } = req.params;

    if (notificationId === "bulk-delete") {
        if (user.notifications.size < 1)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(USER.NO_NOTIFICATIONS);

        const data = {
            count: user.notifications.size,
            ids: [...user.notifications.keys()],
        };

        user.notifications.clear();

        await user.save();

        return res.status(HttpStatusCode.Ok).json(data);
    }
    if (!notificationId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(USER.MISSING_NOTIFICATION_ID);
    if (!user.notifications.has(notificationId))
        return res
            .status(HttpStatusCode.NotFound)
            .json(USER.UNKNOWN_NOTIFICATION);

    const isNotificationDeleted = user.notifications.delete(notificationId);

    await user.save();

    return res.status(HttpStatusCode.Ok).json(isNotificationDeleted);
};
