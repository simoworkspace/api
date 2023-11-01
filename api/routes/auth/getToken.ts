import { HttpStatusCode } from "axios";
import { Request, Response } from "express";

export const getToken = (req: Request, res: Response) => {
    if (req.params.method === "token") {
        return res
            .status(HttpStatusCode.Ok)
            .json({ token: req.cookies.discordUser });
    }
};