import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { guildSchema } from "../../models/Guild";
import { GUILD } from "../../helpers/errors.json";
import { verify, JwtPayload } from "jsonwebtoken";
import type { Snowflake } from "../../typings/types";

/**
 * Deletes a guild
 */
export const deleteGuild = async (req: Request, res: Response) => {
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

    await guildSchema.deleteOne({ _id: guildId }, { new: true });

    return res.status(HttpStatusCode.Ok).json(guild);
};
