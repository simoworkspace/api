import type { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { TeamPermissions } from "../../typings/types";
import { updateTeamValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { updateMember } from "./updateMember";

export const updateTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers);

    if (req.params.inviteCode === "members")
        return updateMember(req, res, userId);

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

    const updatedTeam = await teamModel.findOneAndUpdate(
        { id: teamId },
        { $set: body },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(updatedTeam);
};
