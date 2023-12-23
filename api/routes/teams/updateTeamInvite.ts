import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import {
    APIEvents,
    AuditLogActionType,
    Events,
    TeamPermissions,
} from "../../typings/types";
import { createAuditLogEntry } from "../audit-logs/createAuditLogEntry";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const updateTeamInvite = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const member = team.members.find((member) => member.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res.status(HttpStatusCode.Forbidden).json(TEAM.USER_IS_READONLY);

    const inviteCode = Math.random().toString(36).slice(2, 8);

    await team.updateOne({ $set: { invite_code: inviteCode } });
    await createAuditLogEntry({
        executor_id: userId,
        teamId: team.id,
        action_type: AuditLogActionType.InviteUpdate,
        changes: [
            {
                changed_key: "invite_code",
                old_value: team.invite_code,
                new_value: inviteCode,
            },
        ],
    });

    res.status(HttpStatusCode.Ok).json({ invite_code: inviteCode });

    const teamBots = await botModel.find({ team_id: team.id });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (
                botSocket &&
                botSocket.data?.events.includes(Events.InviteCodeUpdate)
            )
                botSocket.socket.emit(
                    "message",
                    (APIEvents[Events.InviteCodeUpdate],
                    makeEventData({
                        event_type: Events.InviteCodeUpdate,
                        payload: {
                            invite_code: inviteCode,
                            team_id: team.id,
                            user_id: userId,
                        },
                    }))
                );
        }
    }
};
