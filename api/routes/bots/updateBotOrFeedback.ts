import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { verify, JwtPayload } from "jsonwebtoken";
import { feedbackSchema } from "../../models/Feedback";
import { patchBotValidator } from "../../validators/bots";
import { patchFeedbackValidator } from "../../validators/feedback";
import { GENERICS, BOT, FEEDBACK } from "../../helpers/errors.json";

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

    if (Object.keys(req.body).length < 1)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.MISSING_BODY);
    if (!patchBotValidator.isValidSync(req.body, { strict: true }))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_PROPS);

    await bot.updateOne(
        { $set: req.body },
        {
            new: true,
        }
    );

    return res.status(HttpStatusCode.Ok).json(bot);
};
