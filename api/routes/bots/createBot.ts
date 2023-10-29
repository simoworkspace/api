import parseMs from "ms";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { verify, JwtPayload } from "jsonwebtoken";
import { feedbackSchema } from "../../models/Feedback";
import { REQUIRED_PROPS } from "../../../constants.json";
import { botSchemaValidator } from "../../validators/bots";
import { feedbackValidator } from "../../validators/feedback";
import { GENERICS, BOT, FEEDBACK } from "../../helpers/errors.json";
import { webhooks } from "../../helpers/webhooks";

/**
 * Creates a bot, vote, or submit a feedback
 */
export const createBot = async (req: Request, res: Response) => {
    const { id: botId, method, user: author } = req.params;

    const JwtPayload = verify(
        req.headers.authorization as string,
        process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (method === "feedbacks") {
        if (!author)
            return res
                .status(HttpStatusCode.NotFound)
                .json(FEEDBACK.UNKNOWN_USER);

        const exists = await feedbackSchema.exists({
            "author.id": JwtPayload.id,
            target_bot: botId
        });

        if (exists)
            return res
                .status(HttpStatusCode.Conflict)
                .json(FEEDBACK.THE_USER_ALREADY_SENT);

        const body = req.body;
        const keys = Object.keys(body);

        if (
            !REQUIRED_PROPS.FEEDBACK.every((property) =>
                keys.includes(property)
            )
        )
            return res.status(HttpStatusCode.BadRequest).json({
                ...GENERICS.SOME_PROPERTIES_IS_MISSING,
                bonus: {
                    missing_properties: REQUIRED_PROPS.FEEDBACK.filter(
                        (property) => !keys.includes(property)
                    ),
                },
            });

        if (!feedbackValidator.isValidSync(body))
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.INVALID_PROPS);

        const createdFeedback = await feedbackSchema.create({
            ...body,
            posted_at: new Date().toISOString(),
            author: {
                username: JwtPayload.username,
                avatar: JwtPayload.avatar,
                id: JwtPayload.id,
            },
            target_bot: botId,
        });

        if (!createdFeedback)
            return res
                .status(HttpStatusCode.InternalServerError)
                .json(GENERICS.INTERNAL_SERVER_ERROR);

        return res.status(HttpStatusCode.Ok).json(createdFeedback);
    }

    const props = req.body;
    const exists = await botSchema.exists({ _id: botId });

    if (method === "votes") {
        if (!exists)
            return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

        if (!("user" in props))
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.MISSING_USER);

        const request = await fetch(
            `https://discord.com/api/v10/users/${props.user}`,
            {
                method: "GET",
                headers: { Authorization: `Bot ${process.env.CLIENT_TOKEN}` },
            }
        );

        const { bot: isBot } = await request.json();

        if (isBot || props.user === botId)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(BOT.BOT_CANNOT_VOTE_IN_A_BOT);

        const votes = await botSchema.findOne({
            _id: botId,
            "votes.user": props.user,
        });

        if (!votes) {
            const voteBody = {
                user: props.user,
                last_vote: new Date().toISOString(),
                votes: 1,
            };

            const newVote = await botSchema.findOneAndUpdate(
                { _id: botId },
                { $push: { votes: voteBody } },
                { new: true }
            );

            return res.status(HttpStatusCode.Ok).json(newVote?.votes);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { last_vote } = votes.votes.find(
            (vote) => vote.user === props.user
        )!;

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

        const vote = await botSchema.findOneAndUpdate(
            { _id: botId, "votes.user": props.user },
            {
                $inc: { "votes.$.votes": 1 },
                $set: { "votes.$.last_vote": new Date().toISOString() },
            },
            { new: true }
        );

        return res.status(HttpStatusCode.Ok).json(vote?.votes);
    }

    const keys = Object.keys(props);

    if (!REQUIRED_PROPS.BOT.every((property) => keys.includes(property)))
        return res.status(HttpStatusCode.Ok).json({
            ...GENERICS.SOME_PROPERTIES_IS_MISSING,
            bonus: {
                missing_properties: REQUIRED_PROPS.BOT.filter(
                    (property) => !keys.includes(property)
                ),
            },
        });

    if (exists)
        return res.status(HttpStatusCode.Conflict).json(BOT.BOT_ALREADY_EXISTS);

    const validation = await botSchemaValidator
        .validate(props)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const createdBot = await botSchema.create({
        ...props,
        _id: botId,
    });

    if (!createdBot)
        return res
            .status(HttpStatusCode.InternalServerError)
            .json(GENERICS.INTERNAL_SERVER_ERROR);

    const createdAt: number = Math.round(new Date(parseFloat(botId) / 4194304 + 1420070400000).getTime() / 1000);

    await webhooks.bot(createdBot, createdAt);
    await webhooks.logs(createdBot);
    await webhooks.raw(createdBot);

    return res.status(HttpStatusCode.Ok).json(createdBot);
};
