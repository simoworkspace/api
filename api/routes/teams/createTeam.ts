import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { botSchema } from "../../models/Bot";
import { HttpStatusCode } from "axios";
import { USER, TEAM } from "../../helpers/errors.json";
import { createTeamValidator } from "../../validators/user";
import { getUserId } from "../../helpers/getUserId";
import { TeamPermissions } from "../../typings/types";

export const createTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);

    if (!userId)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (user.team?.id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_ALREADY_HAVE_A_TEAM);

    const { body } = req;

    const team = await userSchema.findOne({ "team.bot_id": body.bot_id });

    if (team?.team?.bot_id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_IN_A_TEAM);
    if (await botSchema.findById(body.bot_id))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_ADDED);

    const validation = await createTeamValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res.status(HttpStatusCode.BadRequest).json({
            errors: validation,
        });

    const createdTeam = await userSchema.findByIdAndUpdate(
        userId,
        {
            $set: {
                team: {
                    ...body,
                    invite_hash: Math.random().toString(22).slice(2, 8),
                    members: [
                        { id: userId, permission: TeamPermissions.Owner },
                    ],
                    id: Math.random().toString(36).slice(2),
                },
            },
        },
        { new: true, projection: { team: 1 } }
    );

    return res.status(HttpStatusCode.Ok).json(createdTeam?.team);
};
