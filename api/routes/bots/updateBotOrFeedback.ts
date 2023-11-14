import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { patchBotValidator } from "../../validators/bots";
import { BOT, TEAM } from "../../helpers/errors.json";
import { userSchema } from "../../models/User";
import { TeamPermissions } from "../../typings/types";
import { updateFeedback } from "./updateFeedback";
import { getUserId } from "../../helpers/getUserId";

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
    if ("team_id" in body) {
        const team = await userSchema.findOne({ "team.id": body.team_id });

        if (!team)
            return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

        const member = team.team.members.find((mem) => mem.id);

        if (!member)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(TEAM.USER_IS_NOT_A_MEMBER);
        if (
            member.permission !== TeamPermissions.Administrator &&
            !member.owner
        )
            return res
                .status(HttpStatusCode.BadRequest)
                .json(TEAM.USER_IS_READONLY);
    }

    const updatedBot = await botSchema.findByIdAndUpdate(
        botId,
        { $set: body },
        {
            new: true,
        }
    );

    return res.status(HttpStatusCode.Ok).json(updatedBot);
};
