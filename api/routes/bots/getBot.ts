import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { BOT } from "../../utils/errors.json";
import { fetchBotFeedbacks } from "./fetchBotFeedbacks";
import { getUserId } from "../../utils/getUserId";
import { fetchAPIKey } from "./fetchAPIKey";

/**
 * Gets a bot from Discord API or from the database
 */
export const getBot = async (req: Request, res: Response) => {
    const query = req.query;

    if (Object.keys(query).length > 0) {
        const queryLimit =
            typeof query.limit === "string" ? parseInt(query.limit) : 500;

        const { startAt, endAt } = query;

        delete query.endAt;
        delete query.startAt;

        const botsFound = await botSchema
            .find(query, null, {
                limit: queryLimit,
            })
            .sort({ votes_count: -1 });

        return res
            .status(HttpStatusCode.Ok)
            .json(
                botsFound.slice(
                    parseInt(startAt as string),
                    parseInt(endAt as string) || botsFound.length
                )
            );
    }

    const { id: botId, method } = req.params;

    if (method === "api-key") return fetchAPIKey(req, res);
    if (method === "feedbacks") return fetchBotFeedbacks(req, res);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const targetBot = await (botId
        ? botSchema.findById(botId).select("-api_key")
        : botSchema
            .find({ owner_id: userId })
            .sort({ votes_count: -1 })
            .select("-api_key"));

    if (botId) {
        if (Array.isArray(targetBot)) return;

        const botImage = await fetch(
            `https://cdn.discordapp.com/avatars/${targetBot?._id}/${targetBot?.avatar}.png`
        );

        if (botImage.status === HttpStatusCode.NotFound) {
            const request = await fetch(
                `https://discord.com/api/v10/users/${botId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bot ${process.env.CLIENT_TOKEN}`,
                    },
                }
            );

            const botData = await request.json();

            await botSchema.findByIdAndUpdate(botId, {
                name: botData.username,
                avatar: botData.avatar,
            });
        }
    }

    if (!targetBot)
        return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (method === "votes") {
        if (Array.isArray(targetBot))
            return res
                .status(HttpStatusCode.BadRequest)
                .json(BOT.CANNOT_GET_BOT_VOTES);

        return res.status(HttpStatusCode.Ok).json(targetBot.votes);
    }

    return res.status(HttpStatusCode.Ok).json(targetBot);
};
