import { auditLogModel } from "../../models/AuditLog";
import type { AuditLogEntryStructure } from "../../typings/types";

export const createAuditLogEntry = async (
    data: Omit<AuditLogEntryStructure, "id" | "created_at"> & { teamId: string }
) => {
    const { teamId } = data;
    const auditLog = await auditLogModel.findOne({ team_id: teamId });

    const rawEntryData = {
        ...(data as { teamId?: string }),
        id: Math.random().toString(36).slice(2, 8),
        created_at: new Date().toISOString(),
    };

    delete rawEntryData.teamId;

    if (!auditLog)
        return await auditLogModel.create({
            team_id: teamId,
            entries: [rawEntryData],
        });

    await auditLog.updateOne({ $push: { entries: rawEntryData } });

    return rawEntryData;
};
