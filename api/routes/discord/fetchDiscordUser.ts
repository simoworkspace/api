import { HttpStatusCode } from "axios";
import type { Response, Request } from "express";
import { USER } from "../../helpers/errors.json";

export const fetchDiscordUser = async (req: Request, res: Response) => {
    const { CLIENT_TOKEN } = process.env;

    const request = await fetch(
        `https://discord.com/api/v10/users/${req.params.userId}`,
        {
            method: "GET",
            headers: { Authorization: `Bot ${CLIENT_TOKEN}` },
        }
    );

    const userData = await request.json();

    if ("message" in userData)
        return res.status(HttpStatusCode.BadRequest).json(USER.UNKNOWN_USER);

    return res.status(HttpStatusCode.Ok).json(userData);
};
