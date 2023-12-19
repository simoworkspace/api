import { HttpStatusCode } from "axios";
import { feedbackModel } from "../../models/Feedback";
import { FEEDBACK } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { patchFeedbackValidator } from "../../validators/feedback";

export const updateFeedback = async (
    req: Request,
    res: Response,
    { botId, authorId }: { botId: string; authorId: string }
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

    const validation = patchFeedbackValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    if ("reply_message" in body) {
        if (feedback.reply_message) body.reply_message.edited = true;
    }

    const updatedFeedback = await feedbackModel.findOneAndUpdate(
        {
            author_id: authorId,
            target_bot_id: botId,
        },
        { $set: { ...body, edited: true } },
        { new: true, projection: { _id: 0 } }
    );

    return res.status(HttpStatusCode.Ok).json(updatedFeedback);
};
