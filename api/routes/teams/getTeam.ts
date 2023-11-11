import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../helpers/errors.json";
import { getUserId } from "../../helpers/getUserId";
import { getUserByMember } from "../../helpers/getUserByMember";

export const getTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = await getUserId(req.headers);
    const users = await userSchema.find({}, { avatar: 1, username: 1 });

    if (!teamId) {
        const user = await userSchema.findById(userId, {
            __v: 0,
            "team.__v": 0,
        });

        if (!user?.team?.id)
            return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

        return res.status(HttpStatusCode.Ok).json({
            ...user.team,
            members: user.team.members.map((member) =>
                getUserByMember(member, users)
            ),
        });
    }

    if (teamId === "@all") {
        const users = await userSchema.find({ "team.members.id": userId });

        return res.status(HttpStatusCode.Ok).json(
            users.map(({ team }) => ({
                ...team,
                members: team.members.map((member) =>
                    getUserByMember(member, users)
                ),
            }))
        );
    }

    const user = await userSchema.findOne({ "team.id": teamId }, { team: 1 });

    if (!user?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const { team } = user;

    return res.status(HttpStatusCode.Ok).json({
        ...team,
        members: team.members.map((member) => getUserByMember(member, users)),
    });
};
