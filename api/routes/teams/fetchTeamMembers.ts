import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";

export const fetchTeamMembers = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const { members } = team;
    const me = members.find((member) => member.id === userId);

    if (!me)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (req.params.targetId === "@me")
        return res.status(HttpStatusCode.Ok).json(me);

    return res.status(HttpStatusCode.Ok).json(members);
};
