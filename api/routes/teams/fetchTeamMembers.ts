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

    const { targetId } = req.params;

    if (targetId === "@me") return res.status(HttpStatusCode.Ok).json(me);
    if (targetId) {
        const member = members.find((member) => member.id === targetId);

        if (!member)
            return res
                .status(HttpStatusCode.NotFound)
                .json(TEAM.USER_IS_NOT_A_MEMBER);

        return res.status(HttpStatusCode.Ok).json(member);
    }

    return res.status(HttpStatusCode.Ok).json(members);
};
