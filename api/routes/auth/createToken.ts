import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { botModel } from "../../models/Bot";
import { BOT } from "../../utils/errors.json";

const generateHash = (): string => Math.random().toString(20).substring(2);

export const createToken = async (req: Request, res: Response) => {
    const { botId, method } = req.params;

    if (method === "api-key") {
        const userData = verify(
            req.headers.authorization as string,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        const apikey = `${generateHash()}-${generateHash()}-${generateHash()}`;

        const bot = await botModel.findById(botId);

        if (bot && bot.owner_id === userData.id) {
            await botModel.findByIdAndUpdate(botId, {
                api_key: apikey,
            });

            return res.status(HttpStatusCode.Created).json({ api_key: apikey });
        }

        return res.status(HttpStatusCode.Unauthorized).json(BOT.NOT_BOT_OWNER);
    }
};
