import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { BOT } from "../../helpers/errors.json";
import { fetchFeedbacks } from "../../helpers/fetchFeedbacks";
import { fetchVoteStatus } from "../../helpers/fetchVoteStatus";

/**
 * Gets a bot from Discord API or from the database
 */
export const getBot = async (req: Request, res: Response) => {
    const query = req.query;

    if (Object.keys(query).length > 0) {
        const queryLimit =
            typeof query.limit === "string" ? parseInt(query.limit) : 500;

        const botsFound = await botSchema.find(query, null, {
            limit: queryLimit,
        });

        return res.status(HttpStatusCode.Ok).json(botsFound);
    }

    const { id: botId, method } = req.params;

    if (method === "feedbacks") return fetchFeedbacks(req, res);
    if (method === "vote-status") return fetchVoteStatus(req, res);

    const targetBot = await (botId
        ? botSchema.findById({ _id: botId })
        : botSchema.find({}));

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
