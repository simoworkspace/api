import { decode } from "jsonwebtoken";
import { botModel } from "../models/Bot";
import type { Response } from "express";
import { HttpStatusCode } from "axios";
import { GENERICS } from "../utils/errors.json";

export const getUserId = async (auth: string | undefined, res: Response) => {
    const { Unauthorized } = HttpStatusCode;
    const { MISSING_AUTHORIZATION_ERROR, INVALID_AUTH, INVALID_AUTH_PREFIX } =
        GENERICS;

    if (!auth)
        return res.status(Unauthorized).json(MISSING_AUTHORIZATION_ERROR);
    if (!/(Bot|User)\s.+/.test(auth))
        return res.status(Unauthorized).json(INVALID_AUTH_PREFIX);
    if (auth.startsWith("User")) {
        const decoded = decode(auth.slice(5));

        if (typeof decoded === "object" && decoded !== null)
            return decoded.id as string;

        return res.status(Unauthorized).json(INVALID_AUTH);
    } else {
        const bot = await botModel.findOne(
            { api_key: auth.slice(4) },
            { owner_id: 1 }
        );

        if (!bot) return res.status(Unauthorized).json(INVALID_AUTH);

        return bot.owner_id;
    }
};
