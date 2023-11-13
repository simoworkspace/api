import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { FEEDBACK } from "../../helpers/errors.json";
import { feedbackSchema } from "../../models/Feedback";
import { feedbackValidator } from "../../validators/feedback";
import { userSchema } from "../../models/User";

export const createFeedback = async (
    req: Request,
    res: Response,
    { authorId, botId }: { authorId: string | undefined; botId: string }
) => {
    if (!authorId)
        return res.status(HttpStatusCode.NotFound).json(FEEDBACK.UNKNOWN_USER);

    const exists = await feedbackSchema.exists({
        "author.id": authorId,
        target_bot: botId,
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
        author: {
            id: authorId,
            username: author.username,
            avatar: author.avatar,
        },
        target_bot: botId,
    });

    return res.status(HttpStatusCode.Created).json(createdFeedback);
};
