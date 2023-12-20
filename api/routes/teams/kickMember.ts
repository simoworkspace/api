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
import { createAuditLogEntry } from "./createAuditLog";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const kickMember = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const authorId = await getUserId(req.headers.authorization, res);

    if (typeof authorId !== "string") return;

    const member = team.members.find((member) => member.id === authorId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);

    const { targetId, inviteCode: method } = req.params;
    const realTargetId = method === "leave" ? authorId : targetId;

    const memberToRemove = team.members.find(
        (member) => member.id === realTargetId
    );

    if (!memberToRemove)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (memberToRemove.permission === TeamPermissions.Owner)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANT_REMOVE_THE_OWNER);

    const reason = req.headers["x-audit-log-reason"];

    if (reason && reason.length > 428)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.AUDIT_LOG_REASON_LIMIT_EXCEEDED);

    if (realTargetId === authorId) {
        await team.updateOne({
            $set: {
                members: team.members.filter(
                    (member) => member.id !== realTargetId
                ),
            },
        });
        await createAuditLogEntry({
            teamId: team.id,
            executor_id: authorId,
            action_type: AuditLogActionType.MemberAutoKick,
            changes: [],
            reason,
        });

        return res.status(HttpStatusCode.NoContent).send();
    }

    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);
    if (
        memberToRemove.permission === TeamPermissions.Administrator &&
        member.permission === TeamPermissions.Administrator
    )
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANNOT_REMOVE_AN_ADM);

    await team.updateOne({
        $set: {
            members: team.members.filter((member) => member.id !== targetId),
        },
    });
    await createAuditLogEntry({
        teamId: team.id,
        executor_id: authorId,
        action_type: AuditLogActionType.MemberRemove,
        target_id: targetId,
        changes: [],
        reason,
    });

    res.status(HttpStatusCode.Ok).json(memberToRemove);

    const teamBots = await botModel.find({ team_id: team.id });
    const eventData = makeEventData({
        event_type: Events.MemberLeave,
        payload: {
            ...memberToRemove,
            team_id: team.id,
        },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (
                botSocket &&
                botSocket.data?.events.includes(Events.MemberLeave)
            )
                botSocket.socket.emit(APIEvents[Events.MemberLeave], eventData);
        }
    }
};
