import { HttpStatusCode } from "axios";
import { teamModel } from "../../models/Team";
import type { Response } from "express";
import { getUserByMember } from "../../utils/getUserByMember";
import { userSchema } from "../../models/User";

export const fetchUserTeams = async (res: Response, userId: string) => {
    const teams = await teamModel.find({
        members: { $elemMatch: { id: userId } },
    });
    const users = await userSchema.find({});

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
};
