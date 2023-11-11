import { Document } from "mongoose";
import type { TeamMember, UserStructure } from "../typings/types";

export const getUserByMember = (
    member: TeamMember,
    // eslint-disable-next-line @typescript-eslint/ban-types
    users: (Document<unknown, {}, UserStructure> &
        UserStructure &
        Required<{
            _id: string;
        }>)[]
) => {
    const user = users.find(({ _id: userId }) => userId === member.id);

    if (!user) return member;

    return {
        id: member.id,
        permission: member.permission,
        owner: member.owner,
        username: user.username,
        avatar: user.avatar,
    };
};
