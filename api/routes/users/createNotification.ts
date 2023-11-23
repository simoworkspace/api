import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../../helpers/errors.json";
import { createNotificationValidator } from "../../validators/user";
import { getUserId } from "../../helpers/getUserId";

export const createNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const userId = await getUserId(req.headers);
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { body } = req;
    const validation = await createNotificationValidator
        .validate(body)
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
        ...body,
        sent_at: new Date().toISOString(),
    });

    await user.save();

    return res
        .status(HttpStatusCode.Created)
        .json(user.notifications.get(notificationId));
};
