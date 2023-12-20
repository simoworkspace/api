import { HttpStatusCode } from "axios";
import { feedbackModel } from "../../models/Feedback";
import { FEEDBACK } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { patchFeedbackValidator } from "../../validators/feedback";
import {
    APIEvents,
    Events,
    SocketConnectionStructure,
} from "../../typings/types";
import { makeEventData } from "../../utils/makeEventData";

export const updateFeedback = async (
    req: Request,
    res: Response,
    {
        botId,
        authorId,
        userSocket,
    }: {
        botId: string;
        authorId: string;
        userSocket: SocketConnectionStructure | undefined;
    }
) => {
    const { body } = req;
    const feedback = await feedbackModel.findOne({
        author_id: authorId,
        target_bot_id: botId,
    });

    if (!feedback)
        return res
            .status(HttpStatusCode.NotFound)
            .json(FEEDBACK.UNKNOWN_FEEDBACK);

    const validation = await patchFeedbackValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    if ("reply_message_content" in body) {
        body.reply_message = {};

        body.reply_message.content = body.reply_message_content;

        if (feedback.reply_message) body.reply_message.edited = true;

        body.reply_message.posted_at =
            feedback.reply_message?.posted_at ?? new Date().toISOString();
    }

    const updatedFeedback = await feedbackModel.findOneAndUpdate(
        {
            author_id: authorId,
            target_bot_id: botId,
        },
        { $set: { ...body, edited: true } },
        { new: true, projection: { _id: 0 } }
    );

    if (userSocket && userSocket.data?.events.includes(Events.FeedbackUpdate))
        userSocket.socket.emit(
            APIEvents[Events.FeedbackUpdate],
            makeEventData({
                event_type: Events.FeedbackUpdate,
                payload: updatedFeedback,
            })
        );

    return res.status(HttpStatusCode.Ok).json(updatedFeedback);
};
