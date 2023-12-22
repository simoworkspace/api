import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botModel } from "../../models/Bot";
import { patchBotValidator } from "../../validators/bots";
import { BOT } from "../../utils/errors.json";
import { updateFeedback } from "./updateFeedback";
import { getUserId } from "../../utils/getUserId";
import { getSocket } from "../../utils/getSocket";
import { APIEvents, Events } from "../../typings/types";
import { makeEventData } from "../../utils/makeEventData";

/**
 * Updates a bot or feedback
 */
export const updateBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const { authorization: auth } = req.headers;
    const userId = await getUserId(auth, res);

    if (typeof userId !== "string") return;

    const userSocket = getSocket(auth as string);

    const bot = await botModel.findById({
        _id: botId,
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (method === "feedbacks")
        return updateFeedback(req, res, {
            botId,
            authorId: userId,
            userSocket,
            botApproved: bot.approved,
        });

    if (bot.owner_id !== userId)
        return res.status(HttpStatusCode.BadRequest).json(BOT.NOT_BOT_OWNER);
    if (!bot.approved)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(BOT.UNNAPROVED_BOT_ACTION_ERROR);

    const { body } = req;
    const validation = await patchBotValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });
    if ("webhook_url" in body && !bot.api_key)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(BOT.API_KEY_IS_REQUIRED_TO_USE_WEBHOOK);

    const updatedBot = await botModel.findByIdAndUpdate(
        botId,
        { $set: body },
        {
            new: true,
            projection: { __v: 0 },
        }
    );

    if (!updatedBot) return;

    const { _id: id, ...data } = updatedBot.toObject();
    const botData = { id, ...data };

    if (userSocket && userSocket.data?.events.includes(Events.BotUpdate))
        userSocket.socket.emit(
            "message",
            (APIEvents[Events.BotUpdate],
            makeEventData({
                event_type: Events.BotUpdate,
                payload: botData,
            }))
        );

    return res.status(HttpStatusCode.Ok).json(botData);
};
