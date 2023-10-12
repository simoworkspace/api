import axios, { HttpStatusCode } from "axios";
import { JwtPayload, verify } from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";

export const discordLog = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { CLIENT_TOKEN, WEBHOOK_TOKEN } = process.env;

    const payload = verify(
        req.headers.authorization as string,
        process.env.JWT_SECRET as string
    ) as JwtPayload;

    const userId = payload.id;

    if (!userId)
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Wow, look at him. Without JwtPatload is not it?",
        });

    const userAvatar = `https://cdn.discordapp.com/avatars/${userId}/${payload.avatar}.png`;

    await axios
        .post(
            `https://discord.com/api/v10/webhooks/1125236689485435011/${WEBHOOK_TOKEN}`,
            {
                content: `I used the API in the \`${req.path}\` route`,
                username: `${payload.username} (${userId})`,
                avatar_url: userAvatar,
            },
            { headers: { Authorization: `Bot ${CLIENT_TOKEN}` } }
        )
        .catch(console.error);

    next();
};
