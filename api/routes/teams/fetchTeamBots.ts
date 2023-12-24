import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { TEAM } from "../../utils/errors.json";
import { HttpStatusCode } from "axios";
import { getUserId } from "../../utils/getUserId";
import { botModel } from "../../models/Bot";

export const fetchTeamBots = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    if (!team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (team.bots_id.length === 0)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.NO_BOTS_IN_TEAM_ERROR);

    const bots = await botModel.find(
        { team_id: teamId },
        {
            tags: 1,
            short_description: 1,
            _id: 1,
            avatar: 1,
            name: 1,
            votes: 1,
            verified: 1,
        }
    );

    return res.status(HttpStatusCode.Ok).json(
        bots.map((bot) => {
            const { _id: id, ...data } = bot.toObject();

            return { id, ...data };
        })
    );
};
