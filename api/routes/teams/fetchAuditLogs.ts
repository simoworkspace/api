import type { Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { TeamPermissions } from "../../typings/types";
import { auditLogModel } from "../../models/AuditLog";
import { userModel } from "../../models/User";

export const fetchAuditLogs = async (
    res: Response,
    teamId: string,
    authorId: string
) => {
    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const member = team.members.find((member) => member.id === authorId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.AUDIT_LOG_VIEW_PERMISSION_ERROR);

    const auditLogs = await auditLogModel.findOne(
        { team_id: teamId },
        { _id: 0 }
    );

    if (!auditLogs)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.UNKNOWN_AUDIT_LOGS);

    const users = await userModel.find({}, { username: 1, avatar: 1, _id: 1 });

    return res.status(HttpStatusCode.Ok).json({
        ...auditLogs.toObject(),
        entries: auditLogs?.entries.map((entry) => {
            const executor = users.find(
                (user) => user._id === entry.executor_id
            );
            const target = users.find((user) => user._id === entry.target_id);

            return { ...entry, executor, target };
        }),
    });
};
