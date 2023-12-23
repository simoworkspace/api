import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { TeamPermissions } from "../../typings/types";
import { auditLogModel } from "../../models/AuditLog";
import { userModel } from "../../models/User";
import { parseQuery } from "../../utils/parseQuery";

export const fetchAuditLogs = async (
    res: Response,
    req: Request,
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

    const auditLogs = await auditLogModel.findById(teamId);

    if (!auditLogs) {
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.UNKNOWN_AUDIT_LOGS);
    }

    const users = await userModel.find({}, { username: 1, avatar: 1, _id: 1 });
    const {
        executor_id: executorId,
        target_id: targetId,
        action_type: actionType,
    } = parseQuery(req.query as Record<string, string>, {
        ignoreIds: true,
        parseNumbers: true,
    });

    const userMap = new Map();

    users.forEach((user) => {
        userMap.set(user._id, user);
    });

    const filteredEntries = auditLogs.entries.filter((entry) => {
        if (executorId && executorId !== entry.executor_id) return false;
        if (targetId && targetId !== entry.target_id) return false;
        if (typeof actionType === "number" && actionType !== entry.action_type)
            return false;

        return true;
    });

    const entries = filteredEntries.map((entry) => {
        const { executor_id, target_id, ...rest } = entry;
        const executor = userMap.get(executor_id);
        const target = target_id && userMap.get(target_id);

        return {
            ...rest,
            executor,
            target,
        };
    });

    return res.status(HttpStatusCode.Ok).json({
        team_id: auditLogs._id,
        entries,
    });
};
