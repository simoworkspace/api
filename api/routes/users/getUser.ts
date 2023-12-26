import { HttpStatusCode } from "axios";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../utils/errors.json";
import { fetchUserNotifications } from "./fetchUserNotifications";
import { getUserId } from "../../utils/getUserId";
import { Cache } from "../../utils/Cache";
import type { Snowflake, UserStructure } from "../../typings/types";

const MINUTE_IN_MILLISECONDS = 60000;

const cache = new Cache<
    Snowflake,
    Omit<UserStructure, "_id"> & { id: Snowflake }
>(MINUTE_IN_MILLISECONDS);

/**
 * Gets a user notifications or a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    console.log(cache);

    const { method } = req.params;
    let authorId: string | undefined;

    if (["@me", "notifications"].includes(method)) {
        authorId = (await getUserId(req.headers.authorization, res)) as
            | string
            | undefined;

        if (typeof authorId !== "string") return;

        if (method === "@me") {
            if (cache.has(authorId))
                return res.status(HttpStatusCode.Ok).json(cache.get(authorId));

            const me = await userModel.findById(authorId, { __v: 0 });

            if (!me)
                return res
                    .status(HttpStatusCode.NotFound)
                    .json(USER.UNKNOWN_USER);

            const { _id: id, ...userData } = me.toObject();
            const data = { id, ...userData };

            cache.set(authorId, data);

            return res.status(HttpStatusCode.Ok).json(data);
        }

        return fetchUserNotifications(res, authorId);
    }
    if (!method)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (cache.has(method))
        return res.status(HttpStatusCode.Ok).json(cache.get(method));

    const user = await userModel.findById(method, { __v: 0 });

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { _id: id, ...userData } = user.toObject();
    const data = { id, ...userData };

    cache.set(method, data);

    return res.status(HttpStatusCode.Ok).json(data);
};
