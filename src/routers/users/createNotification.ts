import { HttpStatusCode } from "axios";
import { userSchema } from "../../schemas/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../helpers/errors.json";
import type { NotificationBody } from "../../types/types";
import { createNotificationValidator } from "../../validators/user";

export const createNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const { userId } = req.params;
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { body } = req;

    if (!createNotificationValidator.isValidSync(body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_PROPS);

    const notificationId = parseInt([...user.notifications.keys()][user.notifications.size - 1]) + 1;

    user.notifications.set(`${notificationId}`, {
        ...body,
        sent_at: Date.now(),
    } as NotificationBody);

    await user.save();

    return res.status(HttpStatusCode.NoContent).json(user.notifications);
};
