import type { Request, Response } from "express";
import { botModel } from "../../models/Bot";
import { HttpStatusCode } from "axios";
import { BOT } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";

export const fetchWebhookURL = async (req: Request, res: Response) => {
    const bot = await botModel.findById(req.params.id, {
        owner_id: 1,
        webhook_url: 1,
        approved: 1,
    });

    if (!bot) return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;
    if (userId !== bot.owner_id)
        return res.status(HttpStatusCode.Forbidden).json(BOT.NOT_BOT_OWNER);
    if (!bot.approved)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(BOT.UNNAPROVED_BOT_ACTION_ERROR);
    if (!bot.webhook_url)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(BOT.WEBHOOK_URL_IS_NOT_DEFINED);

    return res.status(HttpStatusCode.Ok).json(bot.webhook_url);
};
