import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../helpers/errors.json";

export const getTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = await userSchema.findOne({ "team.id": teamId }, { team: 1 });

    if (!team?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    return res.status(HttpStatusCode.Ok).json(team.team);
};
