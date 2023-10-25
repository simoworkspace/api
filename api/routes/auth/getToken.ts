import { HttpStatusCode } from "axios";
import { JwtPayload, verify } from "jsonwebtoken";
import { Request, Response } from "express";
import { userSchema } from "../../models/User";

export const getToken = async (req: Request, res: Response) => {
    const { method } = req.params;
    const JWT_SECRET = process.env.JWT_SECRET as string;

    if (method === "generate-token") {
        const userData = verify(
            req.headers.authorization as string,
            JWT_SECRET
        ) as JwtPayload;

        const caracters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-abcdefghijklmnopqrstuvwxyz";
        let apikey = "";

        for (let i = 0; i < 30; i++) {
            const randomIndex = Math.floor(Math.random() * caracters.length);
            apikey += caracters[randomIndex];
        }

        await userSchema.findByIdAndUpdate(userData.id, {
            api_key: apikey
        });

        return res
            .status(HttpStatusCode.Created)
            .json({ api_key: apikey });
    }

    return res
        .status(HttpStatusCode.Ok)
        .json({ token: req.cookies.discordUser });
};