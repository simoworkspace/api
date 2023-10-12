import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../../helpers/errors.json";
import type { NotificationBody } from "../../typings/types";
import { createNotificationValidator } from "../../validators/user";

export const createNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const { userId } = req.params;

    if (userId === "@all") {
        if (!createNotificationValidator.isValidSync(req.body))
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.INVALID_PROPS);

        const users = await userSchema.find({});

        for (const user of users) {
            const notificationsId = [...user.notifications.keys()];

            user.notifications.set(
                notificationsId.length < 1
                    ? "1"
                    : `${Math.max(...notificationsId.map(Number)) + 1}`,
                {
                    ...req.body,
                    sent_at: new Date().toISOString(),
                } as NotificationBody
            );

            await user.save();
        }

        return res.status(HttpStatusCode.NoContent).json(null);
    }

    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { body } = req;

    if (!createNotificationValidator.isValidSync(body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_PROPS);

    const notificationsId = [...user.notifications.keys()];

    user.notifications.set(
        notificationsId.length < 1
            ? "1"
            : `${Math.max(...notificationsId.map(Number)) + 1}`,
        {
            ...body,
            sent_at: new Date().toISOString(),
        } as NotificationBody
    );

    await user.save();

    return res.status(HttpStatusCode.NoContent).json(user.notifications);
};
