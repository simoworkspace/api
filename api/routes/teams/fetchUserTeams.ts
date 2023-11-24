import { Response } from "express";
import { userSchema } from "../../models/User";
import { getUserByMember } from "../../utils/getUserByMember";
import { HttpStatusCode } from "axios";

export const fetchUserTeams = async (res: Response, userId: string) => {
    const users = await userSchema.find({ "team.members.id": userId });

    return res.status(HttpStatusCode.Ok).json(
        users.map(({ team }) => ({
            ...team,
            members: team.members.map((member) =>
                getUserByMember(member, users)
            ),
        }))
    );
};
