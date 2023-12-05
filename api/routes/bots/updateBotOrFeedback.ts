import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botModel } from "../../models/Bot";
import { patchBotValidator } from "../../validators/bots";
import { BOT, GENERICS } from "../../utils/errors.json";
import { updateFeedback } from "./updateFeedback";
import { getUserId } from "../../utils/getUserId";
import { isDifferent } from "../../utils/isDifferent";

/**
 * Updates a bot or feedback
 */
export const updateBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    if (method === "feedbacks")
        return updateFeedback(req, res, { botId, authorId: userId });

    const bot = await botModel.findById({
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
    if (!isDifferent(bot._doc, body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.UPDATE_VALUE_ERROR);

    const updatedBot = await botModel.findByIdAndUpdate(
        botId,
        { $set: body },
        {
            new: true,
        }
    );

    return res.status(HttpStatusCode.Ok).json(updatedBot);
};
