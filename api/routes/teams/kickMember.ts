import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { TeamPermissions } from "../../typings/types";

export const kickMember = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const authorId = await getUserId(req.headers);
    const member = team.members.find((member) => member.id === authorId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);

    const { targetId } = req.params;

    if (targetId === authorId)
        return res
            .status(HttpStatusCode.Conflict)
            .json(TEAM.CANNOT_REMOVE_YOURSELF);

    const memberToRemove = team.members.find(
        (member) => member.id === targetId
    );

    if (!memberToRemove)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (memberToRemove.permission === TeamPermissions.Owner)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANT_REMOVE_THE_OWNER);
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

    return res.status(HttpStatusCode.Ok).json(memberToRemove);
};