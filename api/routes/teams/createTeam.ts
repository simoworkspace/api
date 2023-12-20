import type { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { teamModel } from "../../models/Team";
import { APIEvents, Events, TeamPermissions } from "../../typings/types";
import { createTeamValidator } from "../../validators/user";
import { addBot } from "./addBot";
import { auditLogModel } from "../../models/AuditLog";
import { PremiumConfigurations } from "../../utils/PremiumConfigurations";
import { userModel } from "../../models/User";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const createTeam = async (req: Request, res: Response) => {
    if (req.params.inviteCode === "bots") return addBot(req, res);

    const { authorization: auth } = req.headers;
    const userId = await getUserId(auth, res);

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

    await auditLogModel.create({ _id: teamId });

    delete (createdTeam as any)._id;

    const userSocket = getSocket(auth as string);

    if (userSocket && userSocket.data?.events.includes(Events.TeamCreate))
        userSocket.socket.emit(
            APIEvents[Events.TeamCreate],
            makeEventData({
                event_type: Events.TeamCreate,
                payload: createdTeam,
            })
        );

    return res.status(HttpStatusCode.Created).json(createdTeam);
};
