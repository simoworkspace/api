import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { feedbackSchema } from "../../models/Feedback";
import { BOT, FEEDBACK, GENERICS } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";

/**
 * Deletes a bot or feedback
 */
export const deleteBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    if (method === "feedbacks") {
        const feedback = await feedbackSchema.findOne({
            target_bot_id: botId,
            author_id: userId,
        });

        if (!feedback)
            return res
                .status(HttpStatusCode.NotFound)
                .json(FEEDBACK.UNKNOWN_FEEDBACK);

        await feedback.deleteOne();

        return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
    }

    const bot = await botSchema.findById(botId);

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (bot.owner_id !== userId)
        return res.status(HttpStatusCode.BadRequest).json(BOT.NOT_BOT_OWNER);

    if (bot.team_id) {
        const team = await teamModel.findOne({ id: bot.team_id });

        if (team) {
            await team.updateOne({ $pull: { bots_id: bot._id } });
        }
    }

    await bot.deleteOne();

    return res.status(HttpStatusCode.Ok).json(bot);
};
