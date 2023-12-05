import { HttpStatusCode } from "axios";
import { GENERICS } from "../utils/errors.json";
import type { Request, Response, NextFunction } from "express";
import { botModel } from "../models/Bot";

export const apiKeyAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const key = req.headers.authorization;
    const botData = await botModel.findOne({
        api_key: key,
    });

    if (botData && key) return next();

    return res.status(HttpStatusCode.Unauthorized).json(GENERICS.INVALID_AUTH);
};
