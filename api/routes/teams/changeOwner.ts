import { HttpStatusCode } from "axios";
import type { Response } from "express";
import { USER, TEAM } from "../../utils/errors.json";
import { userSchema } from "../../models/User";
import { TeamPermissions } from "../../typings/types";
import { teamModel } from "../../models/Team";
import { createAuditLogEntry } from "./createAuditLog";

export const changeOwner = async (
    res: Response,
    {
        userId,
        authorId,
        teamId,
    }: { userId: string; authorId: string; teamId: string }
) => {
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.BadRequest).json(USER.UNKNOWN_USER);

    const userTeams = await teamModel.find({
        members: {
            $elemMatch: { id: authorId, permission: TeamPermissions.Owner },
        },
    });

    if (userTeams.length === 2)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_REACHED_TWO_TEAMS);

    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.BadRequest).json(TEAM.UNKNOWN_TEAM);
    if (userId === authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANNOT_TRANSFER_TO_YOURSELF);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owner = team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    )!;

    if (owner.id !== authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_TRANSFER);
    if (!team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);

    const updatedTeam = await teamModel.findOneAndUpdate(
        { id: teamId },
        {
            $push: {
                members: { id: userId, permission: TeamPermissions.Owner },
            },
            $pull: { members: { id: authorId } },
        }
    );

    await createAuditLogEntry({
        teamId,
        executor_id: authorId,
        target_id: userId,
        changes: [
            {
                changed_key: "id",
                old_value: authorId,
                new_value: authorId,
            },
        ],
    });

    return res.status(HttpStatusCode.Ok).json(updatedTeam);
};
