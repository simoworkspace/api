import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM, BOT } from "../../utils/errors.json";
import { APIEvents, Events, TeamPermissions } from "../../typings/types";
import { getUserId } from "../../utils/getUserId";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const removeBot = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const member = team.members.find((member) => member.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.MISSING_PERMISSION);

    const { targetId: botId } = req.params;

    if (!team.bots_id.includes(botId))
        return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const bot = await botModel.findById(botId);

    if (bot) await bot.updateOne({ team_id: null });

    await team.updateOne({ $pull: { bots_id: botId } });

    res.status(HttpStatusCode.NoContent).send();

    const teamBots = await botModel.find({ team_id: team.id });
    const eventData = makeEventData({
        event_type: Events.TeamBotRemove,
        payload: {
            bot_id: botId,
            team_id: team.id,
        },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (
                botSocket &&
                botSocket.data?.events.includes(Events.TeamBotRemove)
            )
                botSocket.socket.emit("message",(
                    APIEvents[Events.TeamBotRemove],
                    eventData
                );
        }
    }
};
