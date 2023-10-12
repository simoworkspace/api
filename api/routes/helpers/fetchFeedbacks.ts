import { HttpStatusCode } from "axios";
import { FEEDBACK } from "./errors.json";
import { Request, Response } from "express";
import { feedbackSchema } from "../../schemas/Feedback";

/**
 * Fetches all feedbacks from a bot
 */
export const fetchFeedbacks = async (req: Request, res: Response) => {
    const { id: botId } = req.params;

    const data = await feedbackSchema.find({
        target_bot: botId,
    });

    if (!data || data.length < 1)
        return res.status(HttpStatusCode.NoContent).json(FEEDBACK.NO_FEEDBACKS);

    return res.status(HttpStatusCode.Ok).json(data);
};
