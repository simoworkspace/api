import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { FEEDBACK, BOT } from "../../utils/errors.json";
import { feedbackModel } from "../../models/Feedback";
import { feedbackValidator } from "../../validators/feedback";
import { userModel } from "../../models/User";
import { createNotification } from "../users/createNotification";
import {
    APIEvents,
    Events,
    NotificationType,
    SocketConnectionStructure,
} from "../../typings/types";
import { botModel } from "../../models/Bot";
import { makeEventData } from "../../utils/makeEventData";

export const createFeedback = async (
    req: Request,
    res: Response,
    {
        authorId,
        botId,
        userSocket,
    }: {
        authorId: string | undefined;
        botId: string;
        userSocket: SocketConnectionStructure | undefined;
    }
) => {
    if (!authorId)
        return res.status(HttpStatusCode.NotFound).json(FEEDBACK.UNKNOWN_USER);

    const exists = await feedbackModel.exists({
        author_id: authorId,
        target_bot_id: botId,
    });

    if (exists)
        return res
            .status(HttpStatusCode.Conflict)
            .json(FEEDBACK.THE_USER_ALREADY_SENT);

    const { body } = req;

    if (body.reply_message)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(FEEDBACK.CANNOT_REPLY_WHEN_CREATE);

    const validation = await feedbackValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const bot = await botModel.findById(botId);

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const author = await userModel.findById(authorId);

    if (!author)
        return res.status(HttpStatusCode.Ok).json(FEEDBACK.UNKNOWN_AUTHOR);
    if (bot.owner_id === authorId)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(FEEDBACK.BOT_OWNER_CANNOT_SEND_FEEDBACK);

    const createdFeedback = (
        await feedbackModel.create({
            ...body,
            posted_at: new Date().toISOString(),
            author_id: authorId,
            target_bot_id: botId,
        })
    ).toObject();

    const owner = await userModel.findById(bot?.owner_id);

    await createNotification(res, owner?.id as string, {
        content: `**${owner?.username}** Comentou no seu bot **${bot?.name}**\n${body.content}`,
        type: NotificationType.Comment,
    });

    delete (createdFeedback as any)._id;

    if (userSocket && userSocket.data?.events.includes(Events.FeedbackAdd))
        userSocket.socket.emit(
            "message",
            (APIEvents[Events.FeedbackAdd],
            makeEventData({
                event_type: Events.FeedbackAdd,
                payload: createdFeedback,
            }))
        );

    return res.status(HttpStatusCode.Created).json(createdFeedback);
};
