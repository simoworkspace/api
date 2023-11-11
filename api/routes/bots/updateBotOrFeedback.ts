import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { verify, JwtPayload } from "jsonwebtoken";
import { feedbackSchema } from "../../models/Feedback";
import { patchBotValidator } from "../../validators/bots";
import { patchFeedbackValidator } from "../../validators/feedback";
import { GENERICS, BOT, FEEDBACK, TEAM } from "../../helpers/errors.json";
import { userSchema } from "../../models/User";
import { TeamPermissions } from "../../typings/types";

/**
 * Updates a bot or feedback
 */
export const updateBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method, user: author } = req.params;

    if (method === "feedbacks") {
        const { body } = req;

        const feedback = await feedbackSchema.findOne({
            "author.id": author,
            target_bot: botId,
        });

        if (!feedback)
            return res
                .status(HttpStatusCode.NotFound)
                .json(FEEDBACK.UNKNOWN_FEEDBACK);

        const validation = patchFeedbackValidator
            .validate(body)
            .catch((error) => error.errors);

        if (Array.isArray(validation))
            return res
                .status(HttpStatusCode.BadRequest)
                .json({ errors: validation });

        const updatedFeedback = await feedbackSchema.findOneAndUpdate(
            {
                "author.id": author,
                target_bot: botId,
            },
            { $set: { ...body, edited: true } },
            { new: true }
        );

        return res.status(HttpStatusCode.Ok).json(updatedFeedback);
    }

    const bot = await botSchema.findById({
        _id: botId,
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const payload = verify(
        req.headers.authorization as string,
        process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (bot.owner_id !== payload.id)
        return res.status(HttpStatusCode.BadRequest).json(BOT.NOT_BOT_OWNER);

    const { body } = req;

    if (Object.keys(body).length < 1)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.MISSING_BODY);

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

    await bot.updateOne(
        { $set: body },
        {
            new: true,
        }
    );

    return res.status(HttpStatusCode.Ok).json(bot);
};
