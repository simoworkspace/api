import { HttpStatusCode } from "axios";
import { botSchema } from "../../models/Bot";
import { BOT, USER } from "../../helpers/errors.json";
import type { Request, Response } from "express";
import { isUsingJWT } from "../../helpers/isUsingJWT";
import { JwtPayload, decode } from "jsonwebtoken";
import { userSchema } from "../../models/User";

export const getVoteStatus = async (req: Request, res: Response) => {
    const isUsingJwt = isUsingJWT(req.headers);

    const userId = isUsingJwt
        ? (decode(req.headers.authorization as string) as JwtPayload).id
        : req.params.userId;

    if (!userId)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const userExists = await userSchema.exists({ _id: userId });

    if (!userExists)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const botId = isUsingJwt
        ? req.params.userId
        : (await botSchema.findOne({ api_key: req.headers.authorization }))
            ?._id;

    const bot = await botSchema.findById(botId);

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
