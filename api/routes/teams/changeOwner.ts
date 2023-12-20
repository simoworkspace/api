import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { USER, TEAM } from "../../utils/errors.json";
import { userModel } from "../../models/User";
import {
    APIEvents,
    AuditLogActionType,
    Events,
    TeamPermissions,
} from "../../typings/types";
import { teamModel } from "../../models/Team";
import { createAuditLogEntry } from "./createAuditLog";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const changeOwner = async (
    res: Response,
    req: Request,
    {
        userId,
        authorId,
        teamId,
    }: { userId: string; authorId: string; teamId: string }
) => {
    const user = await userModel.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.BadRequest).json(USER.UNKNOWN_USER);

    const userTeams = await teamModel.find({
        members: {
            $elemMatch: { id: authorId, permission: TeamPermissions.Owner },
        },
    });

    if (userTeams.length === 2)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_REACHED_TEAM_LIMIT);

    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.BadRequest).json(TEAM.UNKNOWN_TEAM);
    if (userId === authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANNOT_TRANSFER_TO_YOURSELF);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owner = team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    )!;

    if (owner.id !== authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_TRANSFER);
    if (!team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);

    const reason = req.headers["x-audit-log-reason"];

    if (reason && reason.length > 428)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.AUDIT_LOG_REASON_LIMIT_EXCEEDED);

    const updatedTeam = await teamModel.findOneAndUpdate(
        { id: teamId },
        {
            $push: {
                members: { id: userId, permission: TeamPermissions.Owner },
            },
            $pull: { members: { id: authorId } },
        },
        { new: true, projection: { _id: 0 } }
    );

    await createAuditLogEntry({
        teamId,
        executor_id: authorId,
        target_id: userId,
        changes: [
            {
                changed_key: "id",
                old_value: authorId,
                new_value: authorId,
            },
        ],
        action_type: AuditLogActionType.TeamOwnershipTransfer,
        reason,
    });

    res.status(HttpStatusCode.Ok).json(updatedTeam);

    const teamBots = await botModel.find({ team_id: teamId });
    const eventData = makeEventData({
        event_type: Events.TeamOwnershipTransfer,
        payload: { ...team, old_owner_id: userId },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (
                botSocket &&
                botSocket.data?.events.includes(Events.TeamOwnershipTransfer)
            )
                botSocket.socket.emit("event",
                    APIEvents[Events.TeamOwnershipTransfer],
                    eventData
                );
        }
    }
};
