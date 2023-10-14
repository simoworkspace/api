import { HttpStatusCode } from "axios";
import { freemem, totalmem } from "os";
import { botSchema } from "../../models/Bot";
import { userSchema } from "../../models/User";
import type { Request, Response } from "express";
import { uptime, requestCount } from "../../index";

export const getStatus = async (_: Request, res: Response) => {
    const bots = await botSchema.countDocuments({});
    const loggedUsers = await userSchema.countDocuments({});

    return res.status(HttpStatusCode.Ok).json({
        total_mem: totalmem() / (1024 * 1024),
        free_mem: freemem() / (1024 * 1024),
        users: loggedUsers,
        bots,
        uptime: Date.now() - uptime,
        request_count: requestCount,
    });
};
