import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { patchBotValidator } from "../../validators/bots";
import { BOT } from "../../utils/errors.json";
import { updateFeedback } from "./updateFeedback";
import { getUserId } from "../../utils/getUserId";

/**
 * Updates a bot or feedback
 */
export const updateBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const userId = await getUserId(req.headers);

    if (method === "feedbacks")
        return updateFeedback(req, res, { botId, authorId: userId });

    const bot = await botSchema.findById({
        _id: botId,
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (bot.owner_id !== userId)
        return res.status(HttpStatusCode.BadRequest).json(BOT.NOT_BOT_OWNER);

    const { body } = req;
    const validation = await patchBotValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res.status(HttpStatusCode.BadRequest).json(validation);

    const updatedBot = await botSchema.findByIdAndUpdate(
        botId,
        { $set: body },
        {
            new: true,
        }
    );

    return res.status(HttpStatusCode.Ok).json(updatedBot);
};
