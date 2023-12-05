/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM, GENERICS } from "../../utils/errors.json";
import {
    AnyAuditLogChange,
    AuditLogActionType,
    TeamPermissions,
} from "../../typings/types";
import { updateTeamValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { updateMember } from "./updateMember";
import { createAuditLogEntry } from "./createAuditLog";
import { updateTeamInvite } from "./updateTeamInvite";
import { isDifferent } from "../../utils/isDifferent";

export const updateTeam = async (req: Request, res: Response) => {
    const { teamId, inviteCode } = req.params;
    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    if (inviteCode === "members") return updateMember(req, res, userId);
    if (inviteCode === "invite") return updateTeamInvite(req, res);

    const member = team.members.find((crrMember) => crrMember.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);

    const { body } = req;

    const validation = updateTeamValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });
    if (!isDifferent(team._doc, body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.UPDATE_VALUE_ERROR);

    const updatedTeam = await teamModel.findOneAndUpdate(
        { id: teamId },
        { $set: body },
        { new: true }
    );

    const changes = [] as AnyAuditLogChange[];

    for (const [key, value] of Object.entries(body)) {
        changes.push({
            // @ts-ignore
            changed_key: key,
            // @ts-ignore
            old_value: team[key],
            new_value: value,
        });
    }

    await createAuditLogEntry({
        teamId,
        executor_id: userId,
        action_type: AuditLogActionType.TeamUpdate,
        target_id: null,
        changes: changes,
    });

    return res.status(HttpStatusCode.Ok).json(updatedTeam);
};
