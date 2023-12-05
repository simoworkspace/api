import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import parseMs from "ms";
import { BOT, USER } from "../../utils/errors.json";
import { botModel } from "../../models/Bot";
import { userModel } from "../../models/User";
import { getUserId } from "../../utils/getUserId";

export const createVote = async (
    req: Request,
    res: Response,
    botId: string
) => {
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const user = await userModel.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const request = await fetch(
        `https://discord.com/api/v10/users/${user._id}`,
        {
            method: "GET",
            headers: { Authorization: `Bot ${process.env.CLIENT_TOKEN}` },
        }
    );

    const { bot: isBot } = await request.json();

    if (isBot || user._id === botId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(BOT.BOT_CANNOT_VOTE_IN_A_BOT);

    const votes = await botModel.findOne({
        _id: botId,
        "votes.user_id": user._id,
    });

    if (!votes) {
        const voteBody = {
            user_id: user._id,
            last_vote: new Date().toISOString(),
            votes: 1,
        };

        const newVote = await botModel.findOneAndUpdate(
            { _id: botId },
            { $push: { votes: voteBody } },
            { new: true }
        );

        return res.status(HttpStatusCode.Ok).json(newVote?.votes);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { last_vote } = votes.votes.find((vote) => vote.user_id === user._id)!;

    const twelveHours = 4.32e7;
    const timeLeft = new Date().getTime() - new Date(last_vote).getTime();

    if (!(timeLeft > twelveHours))
        return res.status(HttpStatusCode.TooManyRequests).json({
            message: BOT.COOLDOWN_VOTE.message.replace(
                "{ms}",
                parseMs(twelveHours - timeLeft, { long: true })
            ),
            code: BOT.COOLDOWN_VOTE.code,
        });

    const vote = await botModel.findOneAndUpdate(
        { _id: botId, "votes.user_id": user._id },
        {
            $inc: { "votes.$.votes": 1 },
            $set: {
                "votes.$.last_vote": new Date().toISOString(),
            },
        },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(vote?.votes);
};
