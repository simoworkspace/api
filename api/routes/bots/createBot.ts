import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { botSchemaValidator } from "../../validators/bots";
import { GENERICS, BOT } from "../../utils/errors.json";
import { webhooks } from "../../utils/webhooks";
import { getUserId } from "../../utils/getUserId";
import { createFeedback } from "./createFeedback";
import { createVote } from "./createVote";

/**
 * Creates a bot, vote, or submit a feedback
 */
export const createBot = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const exists = await botSchema.exists({ _id: botId });

    if (method === "feedbacks") {
        if (!exists)
            return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

        return createFeedback(req, res, { authorId: userId, botId });
    }

    if (method === "votes") {
        if (!exists)
            return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

        return createVote(req, res, botId);
    }

    if (exists)
        return res.status(HttpStatusCode.Conflict).json(BOT.BOT_ALREADY_EXISTS);

    const userBots = await botSchema.find({ owner_id: userId });

    if (userBots.length === 2)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(BOT.BOT_CREATE_LIMIT_ERROR);

    const { body } = req;

    const validation = await botSchemaValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const response = await fetch(`https://discord.com/api/v10/users/${botId}`, {
        headers: { Authorization: `Bot ${process.env.CLIENT_TOKEN}` },
    });
    const data = await response.json();

    if ("message" in data)
        return res.status(HttpStatusCode.BadRequest).json(BOT.UNKNOWN_BOT);

    const createdBot = await botSchema.create({
        ...body,
        avatar: data.avatar,
        name: data.username,
        _id: botId,
        owner_id: userId,
    });

    if (!createdBot)
        return res
            .status(HttpStatusCode.InternalServerError)
            .json(GENERICS.INTERNAL_SERVER_ERROR);

    const createdAt = Math.round(
        new Date(parseFloat(botId) / 4194304 + 1420070400000).getTime() / 1000
    );

    await webhooks.bot(createdBot, createdAt);
    await webhooks.logs(createdBot);
    await webhooks.raw(createdBot);

    return res.status(HttpStatusCode.Ok).json(createdBot);
};
