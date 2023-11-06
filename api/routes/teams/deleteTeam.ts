import { Request, Response } from "express";
import { isUsingJWT } from "../../helpers/isUsingJWT";
import { decode } from "jsonwebtoken";
import { botSchema } from "../../models/Bot";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { USER, TEAM } from "../../helpers/errors.json";

export const deleteTeam = async (req: Request, res: Response) => {
    let userId: string | undefined;

    const isUsingjwt = isUsingJWT(req.headers);

    if (isUsingjwt) {
        const decoded = decode(req.headers.authorization as string);

        if (typeof decoded === "object" && decoded !== null && "id" in decoded)
            userId = decoded.id;
    }
    if (!isUsingjwt)
        userId = (
            await botSchema.findOne({ api_key: req.headers.authorization })
        )?.owner_id;

    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
    if (!user.team.id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_HAS_NO_TEAM);

    await user.updateOne({ $unset: { team: 1 } });

    return res.status(HttpStatusCode.Ok).send();
};
