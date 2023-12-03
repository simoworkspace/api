import { Request, Response } from "express";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { TeamPermissions } from "../../typings/types";
import { HttpStatusCode } from "axios";
import { getUserByMember } from "../../utils/getUserByMember";
import { userSchema } from "../../models/User";
import { TEAM } from "../../utils/errors.json";
import { fetchUserTeams } from "./fetchUserTeams";
import { fetchAuditLogs } from "./fetchAuditLogs";
import { fetchTeamBots } from "./fetchTeamBots";

export const getTeam = async (req: Request, res: Response) => {
    const { teamId, inviteCode } = req.params;
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;
    if (teamId === "@all") return fetchUserTeams(res, userId);
    if (inviteCode === "audit-logs") return fetchAuditLogs(res, teamId, userId);
    if (inviteCode === "bots") return fetchTeamBots(req, res);

    const users = await userSchema.find({}, { avatar: 1, username: 1 });

    if (!teamId) {
        const teams = await teamModel.find({
            members: {
                $elemMatch: { id: userId, permission: TeamPermissions.Owner },
            },
        });

        if (teams.length === 0)
            return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

        return res.status(HttpStatusCode.Ok).json(
            teams.map((team) => ({
                ...team._doc,
                members: team.members.map((member) =>
                    getUserByMember(member, users)
                ),
            }))
        );
    }

    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    return res.status(HttpStatusCode.Ok).json({
        ...team._doc,
        members: team.members.map((member) => getUserByMember(member, users)),
    });
};
