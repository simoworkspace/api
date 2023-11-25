import { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { USER, TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";

export const deleteTeam = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers);
    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (!user.team.id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_HAS_NO_TEAM);
    if (user._id !== userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_DELETE);

    await user.updateOne({ $unset: { team: 1 } });

    return res.status(HttpStatusCode.NoContent);
};
