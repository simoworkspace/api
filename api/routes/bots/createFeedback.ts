import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { FEEDBACK } from "../../utils/errors.json";
import { feedbackSchema } from "../../models/Feedback";
import { feedbackValidator } from "../../validators/feedback";
import { userSchema } from "../../models/User";
import { createNotification } from "../users/createNotification";
import { NotificationType } from "../../typings/types";
import { botSchema } from "../../models/Bot";

export const createFeedback = async (
    req: Request,
    res: Response,
    { authorId, botId }: { authorId: string | undefined; botId: string }
) => {
    if (!authorId)
        return res.status(HttpStatusCode.NotFound).json(FEEDBACK.UNKNOWN_USER);

    const exists = await feedbackSchema.exists({
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

    const author = await userSchema.findById(authorId);

    if (!author)
        return res.status(HttpStatusCode.Ok).json(FEEDBACK.UNKNOWN_AUTHOR);

    const createdFeedback = await feedbackSchema.create({
        ...body,
        posted_at: new Date().toISOString(),
        author_id: authorId,
        target_bot_id: botId,
    });

    const bot = await botSchema.findById(botId);
    const owner = await userSchema.findById(bot?.owner_id);

    await createNotification(res, owner?.id as string, {
        content: `**${owner?.username}** Comentou no seu bot **${bot?.name}**\n${body.content}`,
        type: NotificationType.Comment,
    });

    return res.status(HttpStatusCode.Created).json(createdFeedback);
};
