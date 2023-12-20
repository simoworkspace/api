import type { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { TEAM, USER } from "../../utils/errors.json";
import {
    APIEvents,
    AnyAuditLogChange,
    AuditLogActionType,
    Events,
    PremiumType,
    TeamPermissions,
} from "../../typings/types";
import { updateTeamValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";
import { teamModel } from "../../models/Team";
import { updateMember } from "./updateMember";
import { createAuditLogEntry } from "./createAuditLog";
import { updateTeamInvite } from "./updateTeamInvite";
import { userModel } from "../../models/User";
import { botModel } from "../../models/Bot";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const updateTeam = async (req: Request, res: Response) => {
    const { teamId, inviteCode } = req.params;
    const team = await teamModel.findOne({ id: teamId });

    if (!team)
        return res.status(HttpStatusCode.NotFound).json(TEAM.UNKNOWN_TEAM);

    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    if (inviteCode === "members") return updateMember(req, res, userId);
    if (inviteCode === "invite") return updateTeamInvite(req, res);

    const member = team.members.find((crrMember) => crrMember.id === userId);

    if (!member)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_NOT_A_MEMBER);
    if (member.permission === TeamPermissions.ReadOnly)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(TEAM.USER_IS_READONLY);

    const { body } = req;

    const validation = await updateTeamValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });
    if ("vanity_url_code" in body) {
        const { vanity_url_code: vanityCode } = body;

        if (vanityCode === team.vanity_url?.code)
            return res
                .status(HttpStatusCode.Conflict)
                .json(TEAM.VANITY_URL_MUST_DIFFER_FROM_CURRENT);

        const isUsed = await teamModel.exists({
            "vanity_url.code": vanityCode,
        });

        if (isUsed)
            return res
                .status(HttpStatusCode.Conflict)
                .json(TEAM.VANITY_URL_IS_ALREADY_BEING_USED);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const ownerId = team.members.find(
            (member) => member.permission === TeamPermissions.Owner
        )!.id;

        if (ownerId !== userId)
            return res
                .status(HttpStatusCode.Forbidden)
                .json(TEAM.ONLY_OWNER_CAN_UPDATE_VANITY_URL);

        const owner = await userModel.findById(ownerId);

        if (!owner)
            return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);
        if (owner.premium_type !== PremiumType.Advanced)
            return res
                .status(HttpStatusCode.Forbidden)
                .json(TEAM.OWNER_MUST_HAVE_ADVANCED_PREMIUM);

        body.vanity_url = { code: vanityCode, uses: 1 };
    }

    const updatedTeam = await teamModel.findOneAndUpdate(
        { id: teamId },
        { $set: body },
        { new: true, projection: { _id: 0 } }
    );

    const changes = [] as AnyAuditLogChange[];

    for (const [key, value] of Object.entries(body)) {
        if (key === "vanity_url_code") continue;

        changes.push({
            changed_key: key,
            old_value: team[key],
            new_value: value,
        });
    }

    await createAuditLogEntry({
        teamId,
        executor_id: userId,
        action_type: AuditLogActionType.TeamUpdate,
        changes,
    });

    res.status(HttpStatusCode.Ok).json(updatedTeam);

    const teamBots = await botModel.find({ team_id: teamId });
    const eventData = makeEventData({
        event_type: Events.TeamUpdate,
        payload: updatedTeam,
    });

    for (const bot of teamBots) {
        if (!bot.api_key) continue;

        const botSocket = getSocket(bot.api_key);

        if (botSocket && botSocket.data?.events.includes(Events.TeamUpdate))
            botSocket.socket.emit("event",APIEvents[Events.TeamUpdate], eventData);
    }
};
