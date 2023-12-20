import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { APIEvents, Events, TeamPermissions } from "../../typings/types";
import { removeBot } from "./removeBot";
import { auditLogModel } from "../../models/AuditLog";
import { botModel } from "../../models/Bot";
import { kickMember } from "./kickMember";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const deleteTeam = async (req: Request, res: Response) => {
    const { inviteCode: method } = req.params;

    if (method === "bots") return removeBot(req, res);
    if (["members", "leave"].includes(method)) return kickMember(req, res);

    const { authorization: auth } = req.headers;
    const userId = await getUserId(auth, res);

    if (typeof userId !== "string") return;

    const team = await teamModel.findOne({ id: req.params.teamId }, { _id: 0 });

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
    const eventData = makeEventData({ event_type: Events.TeamDelete, payload: team });

    for (const bot of teamBots) {
        await bot.updateOne({ $unset: { team_id: 1 } });

        if (bot.api_key) {
            const botSocket = getSocket(bot.api_key);

            if (botSocket && botSocket.data?.events.includes(Events.TeamDelete))
                botSocket.socket.emit("event",APIEvents[Events.TeamDelete], eventData);
        }
    }

    return res.status(HttpStatusCode.NoContent).send();
};
