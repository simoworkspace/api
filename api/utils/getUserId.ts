import { decode } from "jsonwebtoken";
import { isUsingJWT } from "./isUsingJWT";
import { botSchema } from "../models/Bot";
import type { Response } from "express";
import { HttpStatusCode } from "axios";
import { GENERICS } from "../utils/errors.json";

export const getUserId = async (auth: string | undefined, res: Response) => {
    if (!auth)
        return res
            .status(HttpStatusCode.Unauthorized)
            .json(GENERICS.MISSING_AUTHORIZATION_ERROR);

    let userId: string | undefined;

    if (isUsingJWT(auth)) {
        const decoded = decode(auth);

        if (typeof decoded === "object" && decoded !== null)
            userId = decoded.id;
    } else userId = (await botSchema.findOne({ api_key: auth }))?.owner_id;

    if (!userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.INVALID_AUTH);

    return userId;
};
