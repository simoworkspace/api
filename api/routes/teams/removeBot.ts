import type { Request, Response } from "express";
import { teamModel } from "../../models/Team";
import { HttpStatusCode } from "axios";
import { TEAM, BOT } from "../../utils/errors.json";
import { TeamPermissions } from "../../typings/types";
import { getUserId } from "../../utils/getUserId";
import { botSchema } from "../../models/Bot";

export const removeBot = async (req: Request, res: Response) => {
    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const member = team.members.find((member) => member.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.NotFound)
            .json(TEAM.AUTHOR_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.Forbidden)
            .json(TEAM.MISSING_PERMISSION);

    const { targetId: botId } = req.params;

    if (!team.bots_id.includes(botId))
        return res.status(HttpStatusCode.NotFound).json(BOT.UNKNOWN_BOT);

    const bot = await botSchema.findById(botId);

    if (bot) await bot.updateOne({ team_id: null });

    await team.updateOne({ $pull: { bots_id: botId } });

    return res.status(HttpStatusCode.NoContent).send();
};
