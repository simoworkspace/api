import { Request, Response } from "express";
import { getUserId } from "../../helpers/getUserId";
import { HttpStatusCode } from "axios";
import { USER, TEAM } from "../../helpers/errors.json";
import { userSchema } from "../../models/User";
import { TeamPermissions } from "../../typings/types";
import { changeOwner } from "./changeOwner";
import { removeMember } from "./removeMember";

export const joinTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);

    if (!userId)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { teamId, invite } = req.params;

    if (teamId === "change-owner")
        return changeOwner(res, { userId: invite, authorId: userId });
    if (invite === "remove-member") return removeMember(req, res);

    const user = await userSchema.findOne({ "team.id": teamId });

    if (!user?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const { team } = user;

    if (team.invite_hash !== invite)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.INVALID_INVITE_HASH);
    if (team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ALREADY_A_MEMBER);

    await user.updateOne({
        $push: {
            "team.members": {
                id: userId,
                permission: TeamPermissions.ReadOnly,
            },
        },
    });

    return res.status(HttpStatusCode.Ok).json(true);
};
