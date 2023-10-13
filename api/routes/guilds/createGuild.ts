import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { guildSchema } from "../../schemas/Guild";
import { guildValidator } from "../../validators/guild";
import { GENERICS, GUILD } from "../helpers/errors.json";
import { REQUIRED_PROPS } from "../../../constants.json";

/**
 * Creates a guild
 */
export const createGuild = async (req: Request, res: Response) => {
    const { guildId } = req.params;

    const props = req.body;
    const keys = Object.keys(props);

    if (!REQUIRED_PROPS.GUILD.every((prop) => keys.includes(prop)))
        return res.status(HttpStatusCode.BadRequest).json({
            ...GENERICS.SOME_PROPERTIES_IS_MISSING,
            bonus: {
                missing_properties: REQUIRED_PROPS.GUILD.filter(
                    (property) => !keys.includes(property)
                ),
            },
        });

    if (!guildValidator.isValidSync(props))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_PROPS);

    const exists = await guildSchema.exists({ _id: guildId });

    if (exists)
        return res
            .status(HttpStatusCode.Conflict)
            .json(GUILD.GUILD_ALREADY_EXISTS);

    const createdGuild = await guildSchema.create({
        ...props,
        _id: guildId,
    });

    if (!createdGuild)
        return res
            .status(HttpStatusCode.InternalServerError)
            .json(GENERICS.INTERNAL_SERVER_ERROR);

    return res.status(HttpStatusCode.Created).json(createdGuild);
};
