import { HttpStatusCode } from "axios";
import { GENERICS } from "../helpers/errors.json";
import type { Request, Response, NextFunction } from "express";
import { botSchema } from "../models/Bot";

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers.authorization;
    const botData = await botSchema.findOne({
        api_key: key
    });

    if (botData) return next();

    return res
        .status(HttpStatusCode.Unauthorized)
        .json(GENERICS.INVALID_AUTH);
};