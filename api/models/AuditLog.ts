import { Schema, model } from "mongoose";
import type { AuditLogStructure } from "../typings/types";

const rawAuditLogSchema = new Schema<AuditLogStructure>(
    {
        team_id: String,
        executor_id: String,
        created_at: String,
        id: String,
        action_type: Number,
        changes: [Object],
    },
    { versionKey: false }
);

export const auditLogModel = model("auditLog", rawAuditLogSchema);
