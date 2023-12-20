import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { botModel } from "../../models/Bot";
import { feedbackModel } from "../../models/Feedback";
import { BOT, FEEDBACK, GENERICS } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { APIEvents, Events } from "../../typings/types";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

/**
 * Deletes a bot or feedback
 */
export const deleteBotOrFeedback = async (req: Request, res: Response) => {
    const { id: botId, method } = req.params;
    const { authorization: auth } = req.headers;
    const userId = await getUserId(auth, res);

    if (typeof userId !== "string") return;

    const userSocket = getSocket(auth as string);

    if (method === "feedbacks") {
        const feedback = await feedbackModel.findOne({
            target_bot_id: botId,
            author_id: userId,
        });

        if (!feedback)
            return res
                .status(HttpStatusCode.NotFound)
                .json(FEEDBACK.UNKNOWN_FEEDBACK);

        await feedback.deleteOne();

        if (
            userSocket &&
            userSocket.data?.events.includes(Events.FeedbackDelete)
        )
            userSocket.socket.emit("event",
                APIEvents[Events.FeedbackDelete],
                makeEventData({
                    event_type: Events.FeedbackDelete,
                    payload: feedback,
                })
            );

        return res.status(HttpStatusCode.Ok).json(GENERICS.SUCCESS);
    }

    const bot = await botModel.findById(botId);

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

    if (userSocket && userSocket.data?.events.includes(Events.BotDelete))
        userSocket.socket.emit("event",
            APIEvents[Events.BotDelete],
            makeEventData({ event_type: Events.BotDelete, payload: bot })
        );

    return res.status(HttpStatusCode.Ok).json(bot);
};
