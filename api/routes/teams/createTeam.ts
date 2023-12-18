import type { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { HttpStatusCode } from "axios";
import { TEAM, BOT } from "../../utils/errors.json";
import { teamModel } from "../../models/Team";
import { TeamPermissions } from "../../typings/types";
import { botModel } from "../../models/Bot";
import { createTeamValidator } from "../../validators/user";
import { addBot } from "./addBot";
import { auditLogModel } from "../../models/AuditLog";
import { PremiumConfigurations } from "../../utils/PremiumConfigurations";
import { userModel } from "../../models/User";

export const createTeam = async (req: Request, res: Response) => {
    if (req.params.inviteCode === "bots") return addBot(req, res);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const userTeams = await teamModel.find({
        members: {
            $elemMatch: { id: userId, permission: TeamPermissions.Owner },
        },
    });
    const user = await userModel.findById(userId);

    if (!user) return;
    if (
        PremiumConfigurations[user.premium_type].bots_count === userTeams.length
    )
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_REACHED_TEAM_LIMIT);

    const { body } = req;

    if (!("bots_id" in body) || !Array.isArray(body.bots_id))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.MISSING_BOTS_ID_ERROR);

    const isSomeBotInATeam = await teamModel.exists({
        bots_id: { $in: body.bots_id },
    });

    if (isSomeBotInATeam)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_IN_A_TEAM);

    for (const botId of body.bots_id) {
        const bot = await botModel.findById(botId);

        if (!bot)
            return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);
        if (bot.owner_id !== userId)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(TEAM.ONLY_BOT_OWNER_CAN_ADD_IT);
    }

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

    for (const botId of body.bots_id) {
        await botModel.findByIdAndUpdate(botId, { team_id: teamId });
    }

    await auditLogModel.create({ _id: teamId });

    delete (createdTeam as any)._id;

    return res.status(HttpStatusCode.Created).json(createdTeam);
};
