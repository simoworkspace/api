import type { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { HttpStatusCode } from "axios";
import { GENERICS, TEAM, BOT } from "../../utils/errors.json";
import { teamModel } from "../../models/Team";
import { TeamPermissions } from "../../typings/types";
import { botSchema } from "../../models/Bot";
import { createTeamValidator } from "../../validators/user";

export const createTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);

    if (!userId)
        return res.status(HttpStatusCode.NotFound).json(GENERICS.INVALID_AUTH);

    const userTeams = await teamModel.find({
        members: {
            $elemMatch: { id: userId, permission: TeamPermissions.Owner },
        },
    });

    if (userTeams.length === 2)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_REACHED_TWO_TEAMS);

    const { body } = req;
    const isBotInATeam = await teamModel.exists({ bot_id: body.bot_id });

    if (isBotInATeam)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_IN_A_TEAM);

    const bot = await botSchema.findById(body.bot_id);

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
    if (bot.owner_id !== userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_BOT_OWNER_CAN_ADD_IT);

    const validation = await createTeamValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res.status(HttpStatusCode.BadRequest).json({
            errors: validation,
        });

    const teamId = Math.random().toString(36).slice(2);
    const createdTeam = await teamModel.create({
        ...body,
        invite_code: Math.random().toString(36).slice(2, 8),
        members: [{ id: userId, permission: TeamPermissions.Owner }],
        id: teamId,
    });

    await bot.updateOne({ team_id: teamId });

    delete createdTeam.__v;

    return res.status(HttpStatusCode.Created).json(createdTeam);
};
