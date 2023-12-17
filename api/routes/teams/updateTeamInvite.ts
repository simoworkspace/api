import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { AuditLogActionType, TeamPermissions } from "../../typings/types";
import { createAuditLogEntry } from "./createAuditLog";

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

    return res.status(HttpStatusCode.Ok).json({ invite_code: inviteCode });
};
