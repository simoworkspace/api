import { HttpStatusCode } from "axios";
import { botSchema } from "../../models/Bot";
import { GENERICS, BOT } from "../../helpers/errors.json";
import type { Request, Response } from "express";

export const getVoteStatus = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const botId = (
        await botSchema.findOne({
            api_key: req.headers.authorization,
        })
    )?._id;

    if (!userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.MISSING_USER);

    const bot = await botSchema.findById({ _id: botId });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const vote = bot.votes.find((vote) => vote.user === userId);

    if (!vote)
        return res
            .status(HttpStatusCode.Ok)
            .json({ can_vote: true, rest_time: null });

    const twelveHours = 4.32e7;
    const timeLeft = Date.now() - new Date(vote.last_vote).getTime();

    return res.status(HttpStatusCode.Ok).json({
        can_vote: timeLeft > twelveHours,
        rest_time: timeLeft > twelveHours ? null : twelveHours - timeLeft,
    });
};
