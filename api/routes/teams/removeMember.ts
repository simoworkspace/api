import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../helpers/errors.json";
import { getUserId } from "../../helpers/getUserId";
import { TeamPermissions } from "../../typings/types";

export const removeMember = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const user = await userSchema.findOne({ "team.id": teamId });

    if (!user?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const { team } = user;
    const userId = await getUserId(req.headers);

    const member = team.members.find((mbr) => mbr.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);
    if (!("member_id" in req.body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.MISSING_MEMBER_ID_TO_REMOVE);
    if (userId === req.body.member_id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANNOT_REMOVE_YOURSELF);

    const memberToRemove = team.members.find(
        (mbr) => mbr.id === req.body.member_id
    );

    if (!memberToRemove)
        return res
            .status(HttpStatusCode.BadRequest)
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

    const updatedTeam = await userSchema.findOneAndUpdate(
        {
            "team.id": teamId,
        },
        {
            $set: {
                "team.members": team.members.filter(
                    (mbr) => mbr.id !== memberToRemove.id
                ),
            },
        }
    );

    return res.status(HttpStatusCode.Ok).json(updatedTeam);
};
