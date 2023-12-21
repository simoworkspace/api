import { HttpStatusCode } from "axios";
import { teamModel } from "../../models/Team";
import type { Response } from "express";
import { getUserByMember } from "../../utils/getUserByMember";
import { userModel } from "../../models/User";

export const fetchUserTeams = async (res: Response, userId: string) => {
    const teams = await teamModel.find(
        {
            members: { $elemMatch: { id: userId } },
        },
        { _id: 0 }
    );
    const users = await userModel.find({});

    return res.status(HttpStatusCode.Ok).json(
        teams.map(
            (team) =>
                ({
                    ...team.toObject(),
                    members: team.members.map((member) =>
                        getUserByMember(member, users)
                    ),
                })
        )
    );
};
