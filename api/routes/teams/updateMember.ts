import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import {
    APIEvents,
    AuditLogActionType,
    Events,
    TeamPermissions,
} from "../../typings/types";
import { updateTeamMemberValidator } from "../../validators/user";
import { createAuditLogEntry } from "./createAuditLog";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const updateMember = async (
    req: Request,
    res: Response,
    authorId: string
) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const member = team.members.find((member) => member.id === authorId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res.status(HttpStatusCode.Forbidden).json(TEAM.USER_IS_READONLY);

    const { targetId } = req.params;

    if (targetId === authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANT_UPDATE_YOURSELF);

    const userMember = team.members.find((member) => member.id === targetId);

    if (!userMember)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (
        userMember.permission === TeamPermissions.Owner ||
        (member.permission === TeamPermissions.Administrator &&
            userMember.permission === TeamPermissions.Administrator)
    )
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANT_UPDATE_THIS_MEMBER);

    const { body } = req;

    const validation = await updateTeamMemberValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const { permission: newPermission } = body;

    if (newPermission === userMember.permission)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.NEW_PERMISSION_MUST_DIFFER_FROM_CURRENT);

    const reason = req.headers["x-audit-log-reason"];

    if (reason && reason.length > 428)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.AUDIT_LOG_REASON_LIMIT_EXCEEDED);

    await teamModel.findOneAndUpdate(
        {
            id: team.id,
            "members.id": targetId,
        },
        {
            $set: {
                "members.$.permission": newPermission,
            },
        }
    );
    await createAuditLogEntry({
        teamId: team.id,
        executor_id: authorId,
        action_type: AuditLogActionType.MemberUpdate,
        target_id: targetId,
        changes: [
            {
                changed_key: "permission",
                old_value: userMember.permission,
                new_value: newPermission,
            },
        ],
        reason,
    });

    res.status(HttpStatusCode.Ok).json({
        id: targetId,
        permission: newPermission,
    });

    const teamBots = await botModel.find({ team_id: team.id });
    const eventData = makeEventData({
        event_type: Events.TeamMemberUpdate,
        payload: {
            member_id: targetId,
            new_permission: newPermission,
            old_permission: userMember.permission,
            team_id: team.id,
        },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (
                botSocket &&
                botSocket.data?.events.includes(Events.TeamMemberUpdate)
            )
                botSocket.socket.emit(
                    "message",
                    (APIEvents[Events.TeamMemberUpdate], eventData)
                );
        }
    }
};
