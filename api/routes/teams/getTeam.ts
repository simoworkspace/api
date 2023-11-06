import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../helpers/errors.json";
import { botSchema } from "../../models/Bot";
import { decode } from "jsonwebtoken";
import { isUsingJWT } from "../../helpers/isUsingJWT";

export const getTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    if (!teamId) {
        let userId: string | undefined;

        const isUsingjwt = isUsingJWT(req.headers);

        if (isUsingjwt) {
            const decoded = decode(req.headers.authorization as string);

            if (
                typeof decoded === "object" &&
                decoded !== null &&
                "id" in decoded
            )
                userId = decoded.id;
        }
        if (!isUsingjwt)
            userId = (
                await botSchema.findOne({ api_key: req.headers.authorization })
            )?.owner_id;

        const user = await userSchema.findById(userId, {
            __v: 0,
            "team.__v": 0,
        });

        return res.status(HttpStatusCode.Ok).json(user?.team);
    }

    const team = await userSchema.findOne({ "team.id": teamId }, { team: 1 });

    if (!team?.team?.id)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    return res.status(HttpStatusCode.Ok).json(team.team);
};
