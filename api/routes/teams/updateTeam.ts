import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { TeamPermissions } from "../../typings/types";
import { updateTeamValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";

export const updateTeam = async (req: Request, res: Response) => {
    const user = await userSchema.findOne({ "team.id": req.params.teamId });

    if (!user?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers);

    const { team } = user;

    const member = team.members.find((member) => member.id === userId);

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

    const options = { ...team, ...body };

    await user.updateOne({
        $set: {
            team: {
                ...options,
                invite_hash: Math.random().toString(22).slice(2, 8),
            },
        },
    });

    return res.status(HttpStatusCode.Ok).json(options);
};
