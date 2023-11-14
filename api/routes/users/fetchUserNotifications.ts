import { HttpStatusCode } from "axios";
import { USER } from "../../helpers/errors.json";
import type { Response } from "express";
import { userSchema } from "../../models/User";

export const fetchUserNotifications = async (res: Response, userId: string) => {
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(user.notifications);
};
