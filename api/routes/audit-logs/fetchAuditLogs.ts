import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM, GENERICS } from "../../utils/errors.json";
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
        start_at: startAt,
        end_at: endAt,
    } = parseQuery(req.query as Record<string, string>, {
        ignoreIds: true,
        parseNumbers: true,
    });

    if ((startAt as number) < 0 || (endAt as number) > 50)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_JSON_BODY);

    const userMap = new Map();

    users.forEach((user) => {
        userMap.set(user._id, user);
    });

    const filteredEntries = auditLogs.entries
        .filter((entry) => {
            if (executorId && executorId !== entry.executor_id) return false;
            if (targetId && targetId !== entry.target_id) return false;
            if (
                typeof actionType === "number" &&
                actionType !== entry.action_type
            )
                return false;

            return true;
        })
        .slice(
            (startAt as number | undefined) ?? 0,
            (endAt as number | undefined) ?? 50
        );

    const entries = filteredEntries.map((entry) => {
        const { executor_id, target_id, ...rest } = entry;
        const executor = userMap.get(executor_id);
        const target = target_id && userMap.get(target_id);

        const rawUser = ({
            _id: id,
            username,
            avatar,
        }: Record<string, unknown>) => {
            return { id, username, avatar };
        };

        return {
            ...rest,
            executor: executor && rawUser(executor),
            target: target && rawUser(executor),
        };
    });

    return res.status(HttpStatusCode.Ok).json({
        team_id: auditLogs._id,
        entries,
    });
};
