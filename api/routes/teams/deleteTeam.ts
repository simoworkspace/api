import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { TeamPermissions } from "../../typings/types";

export const deleteTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);

    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const owner = team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    );

    if (!owner) return;

    if (owner.id !== userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_DELETE);

    await team.deleteOne();

    return res.status(HttpStatusCode.NoContent).send();
};
