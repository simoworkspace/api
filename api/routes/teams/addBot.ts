import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM, BOT } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { APIEvents, Events, TeamPermissions } from "../../typings/types";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const addBot = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId }, { _id: 0 });

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

    const maxBotsPerTeam = 3;

    if (team.bots_id.length === maxBotsPerTeam)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.BOT_LIMIT_EXCEEDED_ERROR);

    const { targetId: botId } = req.params;

    const bot = await botModel.findById(botId);

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (team.bots_id.includes(botId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_ADDED_TO_TEAM);
    if (bot.team_id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_IN_A_TEAM);
    if (bot.owner_id !== userId)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.ONLY_BOT_OWNER_CAN_ADD_IT);

    await bot.updateOne({ team_id: team.id });
    await team.updateOne({ $push: { bots_id: botId } });

    res.status(HttpStatusCode.Ok).json(team);

    const teamBots = await botModel.find({ team_id: team.id });
    const eventData = makeEventData({
        event_type: Events.TeamBotAdd,
        payload: { ...team, bot_id: botId },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (botSocket && botSocket.data?.events.includes(Events.TeamBotAdd))
                botSocket.socket.emit(APIEvents[Events.TeamBotAdd], eventData);
        }
    }
};
