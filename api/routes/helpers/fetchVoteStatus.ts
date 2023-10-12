import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { GENERICS, BOT } from "./errors.json";
import { botSchema } from "../../schemas/Bot";

/**
 * View information about a user vote's
 */
export const fetchVoteStatus = async (req: Request, res: Response) => {
    const { id: botId, user } = req.params;

    if (!user)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.MISSING_USER);

    const bot = await botSchema.findById({ _id: botId });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const vote = bot.votes.find((vote) => vote.user === user);

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
