import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { TeamPermissions } from "../../typings/types";
import { removeBot } from "./removeBot";
import { auditLogModel } from "../../models/AuditLog";
import { botModel } from "../../models/Bot";
import { kickMember } from "./kickMember";

export const deleteTeam = async (req: Request, res: Response) => {
    const { inviteCode: method } = req.params;

    if (method === "bots") return removeBot(req, res);
    if (["members", "leave"].includes(method)) return kickMember(req, res);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const team = await teamModel.findOne({ id: req.params.teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const owner = team.members.find(
        (member) => member.permission === TeamPermissions.Owner
    );

    if (!owner) return;

    if (owner.id !== userId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.ONLY_THE_OWNER_CAN_DELETE);

    await team.deleteOne();
    await auditLogModel.deleteOne({ team_id: team.id });

    const teamBots = await botModel.find({ _id: { $in: team.bots_id } });

    if (teamBots.length > 0) {
        for (const bot of teamBots)
            await bot.updateOne({ $unset: { team_id: 1 } });
    }

    return res.status(HttpStatusCode.NoContent).send();
};
