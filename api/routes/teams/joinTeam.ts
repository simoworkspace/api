import type { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { AuditLogActionType, TeamPermissions } from "../../typings/types";
import { changeOwner } from "./changeOwner";
import { createAuditLogEntry } from "./createAuditLog";
import { userModel } from "../../models/User";
import { PremiumConfigurations } from "../../utils/PremiumConfigurations";

export const joinTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const { teamId, inviteCode } = req.params;

    if (teamId === "change-owner")
        return changeOwner(res, {
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

    await team.updateOne({
        $push: {
            members: { id: userId, permission: TeamPermissions.ReadOnly },
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
        await team.updateOne({ "vanity_url.uses": { $inc: 1 } });

    return res.status(HttpStatusCode.NoContent).send();
};
