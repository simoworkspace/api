import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../schemas/Bot";
import { JwtPayload, verify } from "jsonwebtoken";
import { feedbackSchema } from "../../schemas/Feedback";
import { BOT, FEEDBACK, GENERICS } from "../helpers/errors.json";

/**
 * Deletes a bot or feedback
 */
export const deleteBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method, user: author } = req.params;

    if (method === "feedbacks") {
        const feedback = await feedbackSchema.findOne({
            target_bot: botId,
            "author.id": author
        });

        if (!feedback)
            return res
                .status(HttpStatusCode.NotFound)
                .json(FEEDBACK.UNKNOWN_FEEDBACK);

        await feedback.deleteOne();

        return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
    }

    const botOwnerId = author;

    const bot = await botSchema.findById({
        _id: botId,
        owners: { $in: [botOwnerId] },
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const JwtPayload = verify(
        req.headers.authorization as string,
        process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!bot.owners.includes(JwtPayload.id))
        return res.status(HttpStatusCode.BadRequest).json(BOT.NOT_BOT_OWNER);

    await bot.deleteOne();

    return res.status(HttpStatusCode.Ok).json(bot);
};
