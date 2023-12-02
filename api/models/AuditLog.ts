import { Schema, model } from "mongoose";
import type { AuditLogStructure } from "../typings/types";

const rawAuditLogSchema = new Schema<AuditLogStructure>(
    {
        team_id: String,
        entries: {
            type: [Object],
            default: [],
        },
    },
    { versionKey: false }
);

export const auditLogModel = model("auditLog", rawAuditLogSchema);
