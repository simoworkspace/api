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

export const getTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = await getUserId(req.headers);

    if (teamId === "@all") return fetchUserTeams(res, userId);
    if (req.params.inviteCode === "audit-logs")
        return fetchAuditLogs(res, teamId, userId);

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
            teams.map(
                (team) =>
                    ({
                        ...team,
                        members: team.members.map((member) =>
                            getUserByMember(member, users)
                        ),
                    })._doc
            )
        );
    }

    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    return res.status(HttpStatusCode.Ok).json(
        {
            ...team,
            members: team.members.map((member) =>
                getUserByMember(member, users)
            ),
        }._doc
    );
};
