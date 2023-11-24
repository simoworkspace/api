import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { botSchemaValidator } from "../../validators/bots";
import { GENERICS, BOT } from "../../helpers/errors.json";
import { webhooks } from "../../helpers/webhooks";
import { getUserId } from "../../helpers/getUserId";
import { createFeedback } from "./createFeedback";
import { createVote } from "./createVote";

/**
 * Creates a bot, vote, or submit a feedback
 */
export const createBot = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const userId = await getUserId(req.headers);

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
