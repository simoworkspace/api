import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../../helpers/errors.json";

export const deleteNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const { userId, notificationId } = req.params;
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (notificationId === "bulk-delete") {
        if (user.notifications.size < 1)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(USER.NO_NOTIFICATIONS);
        if (user.notifications.size < 1)
            return res
                .status(HttpStatusCode.Forbidden)
                .json(USER.INVALID_NOTIFICATIONS_SIZE);

        user.notifications.clear();

        await user.save();

        return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
    }
    if (!notificationId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(USER.MISSING_NOTIFICATION_ID);
    if (!user.notifications.has(notificationId))
        return res
            .status(HttpStatusCode.NotFound)
            .json(USER.UNKNOWN_NOTIFICATION);

    user.notifications.delete(notificationId);

    await user.save();

    return res.status(HttpStatusCode.NoContent).json(null);
};
