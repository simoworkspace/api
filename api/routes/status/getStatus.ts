import { HttpStatusCode } from "axios";
import { freemem, totalmem } from "os";
import { botModel } from "../../models/Bot";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { uptime, requestCount } from "../../index";

let lastCount = Date.now();
let bots: number | undefined;
let users: number | undefined;

async function getCount() {
    const [botsCount, usersCount] = await Promise.all([
        botModel.countDocuments(),
        userModel.countDocuments(),
    ]);

    bots = botsCount;
    users = usersCount;
}

export const getStatus = async (_: Request, res: Response) => {
    if (!bots) {
        await getCount();
    }

    const MINUTE_IN_MILlISECONDS = 60000;

    if (Date.now() - lastCount > MINUTE_IN_MILlISECONDS) {
        await getCount();

        lastCount = Date.now();
    }

    return res.status(HttpStatusCode.Ok).json({
        total_mem: totalmem() / (1024 * 1024),
        free_mem: freemem() / (1024 * 1024),
        users,
        bots,
        uptime: Date.now() - uptime,
        request_count: requestCount,
    });
};
