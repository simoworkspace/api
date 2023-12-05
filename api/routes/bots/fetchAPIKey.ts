import type { Request, Response } from "express";
import { botSchema } from "../../models/Bot";
import { HttpStatusCode } from "axios";
import { BOT } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";

export const fetchAPIKey = async (req: Request, res: Response) => {
    const bot = await botSchema.findById(req.params.id, {
        owner_id: 1,
        api_key: 1,
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;
    if (userId !== bot.owner_id)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(BOT.ONLY_BOT_OWNER_CAN_VIEW_API_KEY_ERROR);

    return res.status(HttpStatusCode.Ok).json({ api_key: bot.api_key });
};
