import { auditLogModel } from "../../models/AuditLog";
import type { AuditLogEntryStructure } from "../../typings/types";

export const createAuditLogEntry = async (
    data: Omit<AuditLogEntryStructure, "id" | "created_at" | "reason"> & {
        teamId: string;
        reason?: string | string[];
    }
) => {
    const { teamId } = data;
    const auditLog = await auditLogModel.findById(teamId);

    if (Array.isArray(data.reason)) delete data.reason;

    const rawEntryData = {
        ...(data as { teamId?: string }),
        id: Math.random().toString(36).slice(2, 8),
        created_at: new Date().toISOString(),
    };

    delete rawEntryData.teamId;

    if (!auditLog)
        return await auditLogModel.create({
            _id: teamId,
            entries: [rawEntryData],
        });

    await auditLog.updateOne({
        $push: {
            entries: {
                $each: [rawEntryData],
                $slice: -50,
            },
        },
    });

    return rawEntryData;
};
