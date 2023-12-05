import { HttpStatusCode } from "axios";
import { USER } from "../../utils/errors.json";
import type { Response } from "express";
import { userModel } from "../../models/User";

export const fetchUserNotifications = async (res: Response, userId: string) => {
    const user = await userModel.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(user.notifications);
};
