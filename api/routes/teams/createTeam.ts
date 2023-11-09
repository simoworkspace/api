import type { Request, Response } from "express";
import { userSchema } from "../../models/User";
import { isUsingJWT } from "../../helpers/isUsingJWT";
import { decode } from "jsonwebtoken";
import { botSchema } from "../../models/Bot";
import { HttpStatusCode } from "axios";
import { USER, TEAM } from "../../helpers/errors.json";
import { createTeamValidator } from "../../validators/user";

export const createTeam = async (req: Request, res: Response) => {
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
    if (user.team?.id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_ALREADY_HAVE_A_TEAM);

    const team = await userSchema.findOne({ "team.bot_id": req.body.bot_id });

    if (team?.team?.bot_id)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_IN_A_TEAM);
    if (await botSchema.findById(req.body.bot_id))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.BOT_ALREADY_ADDED);

    const validation = await createTeamValidator
        .validate(req.body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res.status(HttpStatusCode.BadRequest).json({
            errors: validation,
        });

    const createdTeam = await userSchema.findByIdAndUpdate(
        userId,
        {
            $set: {
                team: {
                    ...req.body,
                    id: Math.random().toString(36).slice(2),
                },
            },
        },
        { new: true, projection: { team: 1 } }
    );

    return res.status(HttpStatusCode.Ok).json(createdTeam?.team);
};
