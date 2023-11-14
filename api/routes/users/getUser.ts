import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../helpers/errors.json";
import { fetchUserNotifications } from "./fetchUserNotifications";
import { getUserId } from "../../helpers/getUserId";

/**
 * Gets a user notifications or a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);

    if (req.params.method === "notifications")
        return fetchUserNotifications(res, userId);

    const user = await userSchema.findById(userId, { __v: 0 });

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(user);
};
