import { Schema, model } from "mongoose";
import type { AuditLogStructure } from "../typings/types";

const rawAuditLogSchema = new Schema<AuditLogStructure>(
    {
        team_id: String,
        entries: {
            type: [
                {
                    executor_id: String,
                    created_at: String,
                    id: String,
                    action_type: Number,
                    changes: [
                        {
                            changed_key: String,
                            old_data: Schema.Types.Mixed,
                            new_data: Schema.Types.Mixed,
                        },
                    ],
                    target_id: String,
                },
            ],
            default: [],
        },
    },
    { versionKey: false }
);

export const auditLogModel = model("auditLog", rawAuditLogSchema);
