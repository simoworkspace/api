import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER } from "../helpers/errors.json";

/**
 * Gets a user from Discord API
 */
export const getUser = async (req: Request, res: Response) => {
    const { CLIENT_TOKEN } = process.env;

    const request = await fetch(
        `https://discord.com/api/v10/users/${req.params.userId}`,
        { method: "GET", headers: { Authorization: `Bot ${CLIENT_TOKEN}` } }
    );

    const userData = await request.json();

    const isDiscordError = (data: Record<string, unknown>) =>
        "message" in data && "code" in data;

    if (isDiscordError(userData))
        return res.status(HttpStatusCode.BadRequest).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(userData);
};
