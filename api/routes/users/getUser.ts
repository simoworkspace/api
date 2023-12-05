import { HttpStatusCode } from "axios";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../utils/errors.json";
import { fetchUserNotifications } from "./fetchUserNotifications";
import { getUserId } from "../../utils/getUserId";

/**
 * Gets a user notifications or a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    const { method } = req.params;
    const authorId = await getUserId(req.headers.authorization, res);

    if (typeof authorId !== "string") return;
    if (method === "notifications")
        return fetchUserNotifications(res, authorId);
    if (!method)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const user = await userModel.findById(
        method === "@me" ? authorId : method
    );

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (![authorId, "@me"].includes(method)) user.notifications = null as any;

    return res.status(HttpStatusCode.Ok).json(user);
};
