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
    let authorId: string | undefined;

    if (["@me", "notifications"].includes(method)) {
        authorId = (await getUserId(req.headers.authorization, res)) as
            | string
            | undefined;

        if (typeof authorId !== "string") return;

        if (method === "@me") {
            const me = await userModel.findById(authorId, { __v: 0 });

            if (!me)
                return res
                    .status(HttpStatusCode.NotFound)
                    .json(USER.UNKNOWN_USER);

            const { _id: id, ...data } = me.toObject();

            return res.status(HttpStatusCode.Ok).json({ id, ...data });
        }

        return fetchUserNotifications(res, authorId);
    }
    if (!method)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const user = await userModel.findById(method, { __v: 0 });

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { _id: id, ...data } = user.toObject();

    return res.status(HttpStatusCode.Ok).json({ id, ...data });
};
