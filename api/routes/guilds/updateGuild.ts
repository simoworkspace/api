import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { guildSchema } from "../../schemas/Guild";
import type { Snowflake } from "../../types/types";
import { GENERICS, GUILD } from "../helpers/errors.json";
import { patchGuildValidator } from "../../validators/guild";

/**
 * Updates a guild
 */
export const updateGuild = async (req: Request, res: Response) => {
    const { guildId } = req.params;

    const jwtPayload = verify(
        req.headers.authorization as string,
        process.env.JWT_SECRET as string
    ) as JwtPayload;

    const guildOwnerId = jwtPayload.id as Snowflake;

    const guild = await guildSchema.findById({
        _id: guildId,
        owners: { $in: [guildOwnerId] },
    });

    if (!guild)
        return res.status(HttpStatusCode.NotFound).json(GUILD.GUILD_NOT_FOUND);

    if (!guild.owners.includes(guildOwnerId))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GUILD.NOT_GUILD_OWNER);

    if (!patchGuildValidator.isValidSync(req.body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_PROPS);

    const updatedGuild = await guildSchema.updateOne(
        { _id: guildId },
        req.body,
        {
            new: true,
        }
    );

    if (!updatedGuild)
        return res
            .status(HttpStatusCode.InternalServerError)
            .json(GENERICS.INTERNAL_SERVER_ERROR);

    return res.status(HttpStatusCode.Ok).json(updatedGuild);
};
