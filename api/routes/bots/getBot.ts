import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botModel } from "../../models/Bot";
import { feedbackModel } from "../../models/Feedback";
import { BOT } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { parseQuery } from "../../utils/parseQuery";
import { fetchAPIKey } from "./fetchAPIKey";
import { fetchBotFeedbacks } from "./fetchBotFeedbacks";
import { fetchWebhookURL } from "./fetchWebhookURL";

/**
 * Gets a bot from Discord API or from the database
 */
export const getBot = async (req: Request, res: Response) => {
    const query = req.query;
    const stringifiedQuery = new URLSearchParams(
        query as Record<string, string>
    ).toString();

    const { id: botId } = req.params;

    if (Object.keys(query).length > 0 && !botId) {
        const parsedQuery = parseQuery(stringifiedQuery);

        const { start_at, end_at } = parsedQuery;

        delete parsedQuery.start_at;
        delete parsedQuery.end_at;

        const botsFound = await botModel.find(
            parsedQuery,
            { webhook_url: 0, api_key: 0, __v: 0 },
            {
                limit:
                    typeof parsedQuery.limit === "number"
                        ? parsedQuery.limit
                        : 100,
            }
        );

        return res.status(HttpStatusCode.Ok).json(
            botsFound
                .map((bot) => {
                    const { _id: id, ...data } = bot.toObject();

                    return { id, ...data };
                })
                .slice(
                    typeof start_at === "number" ? start_at : 0,
                    typeof end_at === "number" ? end_at : botsFound.length
                )
        );
    }

    const { method } = req.params;

    if (method === "webhook") return fetchWebhookURL(req, res);
    if (method === "api-key") return fetchAPIKey(req, res);
    if (method === "feedbacks") return fetchBotFeedbacks(req, res);
    if (!botId) {
        const userId = await getUserId(req.headers.authorization, res);

        if (typeof userId !== "string") return;

        const bots = await botModel.find({ owner_id: userId }, { __v: 0 });

        return res.status(HttpStatusCode.Ok).json(
            bots.map((bot) => {
                const { _id: id, ...data } = bot.toObject();

                return { id, ...data };
            })
        );
    }

    const targetBot = await botModel.findById(botId, {
        api_key: 0,
        webhook_url: 0,
        __v: 0,
        _id: 0,
    });

    if (!targetBot)
        return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const botImage = await fetch(
        `https://cdn.discordapp.com/avatars/${botId}/${targetBot.avatar}.png`
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

        await targetBot.updateOne({
            $set: {
                name: botData.username,
                avatar: botData.avatar,
            },
        });
    }

    if (method === "votes") {
        if (Array.isArray(targetBot))
            return res
                .status(HttpStatusCode.BadRequest)
                .json(BOT.CANNOT_GET_BOT_VOTES);

        return res.status(HttpStatusCode.Ok).json(targetBot.votes);
    }

    const options = parseQuery(stringifiedQuery);

    const data = targetBot.toObject();

    if (options.with_feedbacks === true) {
        const botFeedbacks = await feedbackModel.find(
            {
                target_bot_id: botId,
            },
            { _id: 0 }
        );

        Object.defineProperty(data, "fedbacks", {
            value: botFeedbacks,
            enumerable: true,
        });
    }

    if (options.with_votes === false) delete (data as any).votes;

    return res.status(HttpStatusCode.Ok).json({ id: botId, ...data });
};
