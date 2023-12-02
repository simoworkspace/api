import { auditLogModel } from "../../models/AuditLog";
import type { AuditLogEntryStructure } from "../../typings/types";

export const createAuditLogEntry = async (
    data: Omit<AuditLogEntryStructure, "id"> & { teamId: string }
) => {
    const { teamId } = data;
    const auditLog = await auditLogModel.findOne({ team_id: teamId });

    const rawEntryData = {
        ...data,
        id: Math.random().toString(36).slice(2, 8),
    };

    if (!auditLog)
        return await auditLogModel.create({
            team_id: teamId,
            entries: [rawEntryData],
        });

    await auditLog.updateOne({ $push: { entries: rawEntryData } });

    return rawEntryData;
};
