import type { Request, Response } from "express";
import { isUsingJWT } from "../../helpers/isUsingJWT";
import { decode } from "jsonwebtoken";
import { botSchema } from "../../models/Bot";
import { userSchema } from "../../models/User";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../helpers/errors.json";
import { TeamPermissions } from "../../typings/types";
import { updateTeamValidator } from "../../validators/user";

export const updateTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = await userSchema.findOne({ "team.id": teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

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

    const member = team.team.members.find((member) => member.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (member.permission !== TeamPermissions.Administrator && !member.owner)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);

    const { body } = req;

    const validation = updateTeamValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const options = { ...team.team, ...body };

    await team.updateOne({ $set: { team: options } });

    return res.status(HttpStatusCode.Ok).json(options);
};
