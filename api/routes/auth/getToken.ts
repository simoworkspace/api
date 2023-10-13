import { HttpStatusCode } from "axios";
import { Request, Response } from "express";

export const getToken = (req: Request, res: Response) => {
    return res
        .status(HttpStatusCode.Ok)
        .json({ token: req.cookies.discordUser });
};
