import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../utils/errors.json";
import { fetchUserNotifications } from "./fetchUserNotifications";
import { getUserId } from "../../utils/getUserId";

/**
 * Gets a user notifications or a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    const { method } = req.params;
    const authorId = await getUserId(req.headers);

    if (method === "notifications")
        return fetchUserNotifications(res, authorId);
    if (!method)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const user = await userSchema.findById(method === "@me" ? authorId : method, { __v: 0 });

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (method !== authorId) user.notifications = null as any;

    return res.status(HttpStatusCode.Ok).json(user);
};
