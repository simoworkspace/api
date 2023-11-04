import { HttpStatusCode } from "axios";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { USER } from "../../helpers/errors.json";

/**
 * Gets a user notifications or a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    const { userId, method } = req.params;

    if (method === "notifications") {
        const user = await userSchema.findById(userId);

        if (!user)
            return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

        return res.status(HttpStatusCode.Ok).json(user.notifications);
    }

    if (method === "discord") {
        const { CLIENT_TOKEN } = process.env;

        const request = await fetch(
            `https://discord.com/api/v10/users/${userId}`,
            {
                method: "GET",
                headers: { Authorization: `Bot ${CLIENT_TOKEN}` },
            }
        );

        const userData = await request.json();

        if ("message" in userData)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(USER.UNKNOWN_USER);

        return res.status(HttpStatusCode.Ok).json(userData);
    }

    const user = await userSchema.findById(userId, { __v: 0 });

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(user);
};
