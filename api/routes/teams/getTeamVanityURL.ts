import { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { TeamPermissions } from "../../typings/types";

export const getTeamVanityURL = async (req: Request, res: Response) => {
    const team = await teamModel.findOne(
        { id: req.params.teamId },
        { vanity_url: 1, members: 1 }
    );

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
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.MISSING_PERMISSION);

    if (!team.vanity_url)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.UNKNOWN_TEAM_VANITY_URL);

    return res.status(HttpStatusCode.Ok).json(team.vanity_url);
};
