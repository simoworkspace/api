import { HttpStatusCode } from "axios";
import { feedbackSchema } from "../../models/Feedback";
import { FEEDBACK } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { patchFeedbackValidator } from "../../validators/feedback";

export const updateFeedback = async (
    req: Request,
    res: Response,
    { botId, authorId }: { botId: string; authorId: string }
) => {
    const { body } = req;
    const feedback = await feedbackSchema.findOne({
        author_id: authorId,
        target_bot: botId,
    });

    if (!feedback)
        return res
            .status(HttpStatusCode.NotFound)
            .json(FEEDBACK.UNKNOWN_FEEDBACK);

    const validation = patchFeedbackValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const updatedFeedback = await feedbackSchema.findOneAndUpdate(
        {
            author_id: authorId,
            target_bot: botId,
        },
        { $set: { ...body, edited: true } },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(updatedFeedback);
};
