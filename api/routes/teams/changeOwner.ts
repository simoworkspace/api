import { HttpStatusCode } from "axios";
import type { Response } from "express";
import { USER, TEAM } from "../../utils/errors.json";
import { userSchema } from "../../models/User";
import { TeamPermissions } from "../../typings/types";

export const changeOwner = async (
    res: Response,
    { userId, authorId }: { userId: string; authorId: string }
) => {
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.BadRequest).json(USER.UNKNOWN_USER);
    if (user.team.id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_ALREADY_HAVE_A_TEAM);

    const author = await userSchema.findById(authorId);

    if (!author?.team?.id)
        return res.status(HttpStatusCode.BadRequest).json(TEAM.UNKNOWN_TEAM);
    if (userId === authorId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.CANNOT_TRANSFER_TO_YOURSELF);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const owner = author.team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    )!;

    if (owner.id !== author._id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_TRANSFER);
    if (!author.team.members.some((member) => member.id === userId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);

    await author.updateOne({ $set: { team: { members: [] } } });

    const updatedUser = await userSchema.findByIdAndUpdate(userId, {
        $set: {
            team: {
                ...author.team,
                members: author.team.members.map(({ id, permission }) => {
                    if (id === userId)
                        return { id, permission: TeamPermissions.Owner };
                    if (id === authorId)
                        return { id, permission: TeamPermissions.ReadOnly };

                    return { id, permission };
                }),
            },
        },
    });

    return res.status(HttpStatusCode.Ok).json(updatedUser);
};
