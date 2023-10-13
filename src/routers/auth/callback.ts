import { Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import axios, { HttpStatusCode } from "axios";
import { GENERICS } from "../helpers/errors.json";
import { userSchema } from "../../schemas/User";

/** Website callback */
export const callback = async (req: Request, res: Response) => {
    const {
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI,
        SCOPES,
        REDIRECT_AUTH,
        AUTH_LINK,
        JWT_SECRET,
    } = process.env;
    const { code } = req.query;

    const data = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET as string,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI as string,
        scope: JSON.parse(SCOPES as string).join(" "),
    };

    const { method } = req.params;

    if (method === "user") {
        try {
            const userData = verify(
                req.cookies.discordUser,
                JWT_SECRET as string
            );

            return res.status(HttpStatusCode.Ok).send(userData);
        } catch (error) {
            return res.status(HttpStatusCode.InternalServerError).json({
                message: (error as Error).message,
            });
        }
    }

    if (method === "logout") {
        try {
            res.clearCookie("discordUser");

            return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
        } catch (error) {
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.DISCORD_AUTH_ERROR);
        }
    }

    if (method === "callback") {
        try {
            const req = await fetch(
                "https://discord.com/api/v10/oauth2/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams(
                        data as unknown as Record<string, string>
                    ),
                }
            );
            const response = await req.json();

            if (response.error === "invalid_grant")
                return res.redirect(AUTH_LINK as string);

            const accessToken = response.access_token;
            const request = await fetch(
                "https://discord.com/api/v10/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const { username, id, avatar } = await request.json();
            const sevenDays = 604800000;

            const token = sign(
                { username, id, avatar, signed: true },
                JWT_SECRET as string
            );

            if (!await userSchema.findById(id)) {
                await userSchema.create({ username, avatar, _id: id });
            } else {
                await userSchema.findByIdAndUpdate(id, { username, avatar });
            }

            res.cookie("discordUser", token, { maxAge: sevenDays });

            res.redirect(REDIRECT_AUTH as string);

            await axios.post(
                "/api/webhook/login",
                {
                    username: "Api Logs",
                    embeds: [
                        {
                            title: "Login Logs",
                            color: 65441,
                            fields: [
                                {
                                    name: "Informações",
                                    value: `O usuario **${username}**, com o ID: **${id}** fez um novo login.`,
                                    inline: false,
                                },
                                {
                                    name: "Sessão",
                                    value: `A sessão do usuário expira <t:${Math.round(
                                        Date.now() / 1000 + 604800
                                    )}:R>.`,
                                    inline: false,
                                },
                                {
                                    name: "JsonWebtoken",
                                    value: `O JWT da sessão atual é: ||${token}||`,
                                    inline: false,
                                },
                            ],
                            thumbnail: {
                                url: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=2048`,
                            },
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
        } catch {
            res.status(HttpStatusCode.BadRequest).json(
                GENERICS.DISCORD_AUTH_ERROR
            );
        }
    }
};
