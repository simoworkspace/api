import { auditLogModel } from "../../models/AuditLog";
import type { AuditLogStructure } from "../../typings/types";

export const createAuditLog = async (data: Omit<AuditLogStructure, "id">) => {
    const createdAuditLog = await auditLogModel.create({
        ...data,
        id: Math.random().toString(36).slice(2, 8),
    });

    return createdAuditLog;
};
