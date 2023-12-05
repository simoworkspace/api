import { HttpStatusCode } from "axios";
import { feedbackModel } from "../../models/Feedback";
import { FEEDBACK, GENERICS } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { patchFeedbackValidator } from "../../validators/feedback";
import { isDifferent } from "../../utils/isDifferent";

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
    if (!isDifferent(feedback._doc, body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.UPDATE_VALUE_ERROR);

    const updatedFeedback = await feedbackModel.findOneAndUpdate(
        {
            author_id: authorId,
            target_bot_id: botId,
        },
        { $set: { ...body, edited: true } },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(updatedFeedback);
};
