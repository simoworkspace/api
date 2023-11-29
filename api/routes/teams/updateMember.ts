import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { AuditLogActionType, TeamPermissions } from "../../typings/types";
import { updateTeamMemberValidator } from "../../validators/user";
import { createAuditLog } from "./createAuditLog";

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
    await createAuditLog({
        team_id: team.id,
        executor_id: authorId,
        created_at: new Date().toISOString(),
        action_type: AuditLogActionType.MemberUpdate,
        target_id: targetId,
        changes: [
            {
                changed_key: "permission",
                old_value: userMember.permission,
                new_value: newPermission,
            },
        ],
    });

    return res
        .status(HttpStatusCode.Ok)
        .json({ id: targetId, permission: newPermission });
};
