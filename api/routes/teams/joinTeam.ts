import type { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import {
    APIEvents,
    AuditLogActionType,
    Events,
    TeamPermissions,
} from "../../typings/types";
import { changeOwner } from "./changeOwner";
import { createAuditLogEntry } from "./createAuditLog";
import { userModel } from "../../models/User";
import { PremiumConfigurations } from "../../utils/PremiumConfigurations";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const joinTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const { teamId, inviteCode } = req.params;

    if (teamId === "change-owner")
        return changeOwner(res, req, {
            userId: req.params.targetId,
            authorId: userId,
            teamId,
        });

    const team = await teamModel.findOne({ id: teamId });

    if (!team) return res.status(HttpStatusCode.Ok).json(TEAM.UNKNOWN_TEAM);

    const ownerId = team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    )?.id;
    const owner = await userModel.findById(ownerId, { premium_type: 1 });

    if (!owner) return;
    if (
        team.members.length ===
        PremiumConfigurations[owner.premium_type].max_members_in_team
    )
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.MEMBERS_LIMIT_EXCEEDED_ERROR);

    const user = await userModel.findById(userId, { premium_type: 1 });
    const userTeams = await teamModel.find({ members: { id: userId } });

    if (
        user &&
        userTeams.length ===
            PremiumConfigurations[user.premium_type].team_capacity_limit
    )
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.TEAM_LIMIT_EXCEEDED);
    if (
        team.invite_code !== inviteCode &&
        team.vanity_url &&
        team.vanity_url.code !== inviteCode
    )
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.INVALID_INVITE_HASH);
    if (team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ALREADY_A_MEMBER);

    const memberData = { id: userId, permission: TeamPermissions.ReadOnly };

    await team.updateOne({
        $push: {
            members: memberData,
        },
    });
    await createAuditLogEntry({
        teamId,
        executor_id: userId,
        action_type: AuditLogActionType.MemberAdd,
        target_id: userId,
        changes: [],
    });

    if (team.vanity_url && inviteCode === team.vanity_url.code)
        await team.updateOne({ $inc: { "vanity_url.uses": 1 } });

    res.status(HttpStatusCode.NoContent).send();

    const teamBots = await botModel.find({ team_id: teamId });
    const eventData = makeEventData({
        event_type: Events.MemberJoin,
        payload: { ...memberData, team_id: teamId },
    });

    for (const bot of teamBots) {
        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (botSocket && botSocket.data?.events.includes(Events.MemberJoin))
                botSocket.socket.emit(
                    "message",
                    (APIEvents[Events.MemberJoin], eventData)
                );
        }
    }
};
