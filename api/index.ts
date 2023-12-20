import cors from "cors";
import { load } from "env-smart";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import express from "express";
import { getBot } from "./routes/bots/getBot";
import { getUser } from "./routes/users/getUser";
import { getToken } from "./routes/auth/getToken";
import { callback } from "./routes/auth/callback";
import { createBot } from "./routes/bots/createBot";
import { getStatus } from "./routes/status/getStatus";
import { deleteNotification } from "./routes/users/deleteNotification";
import { updateBotOrFeedback } from "./routes/bots/updateBotOrFeedback";
import { deleteBotOrFeedback } from "./routes/bots/deleteBotOrFeedback";
import { createToken } from "./routes/auth/createToken";
import { getVoteStatus } from "./routes/vote-status/getVoteStatus";
import { updateUser } from "./routes/users/updateUser";
import { getTeam } from "./routes/teams/getTeam";
import { createTeam } from "./routes/teams/createTeam";
import { deleteTeam } from "./routes/teams/deleteTeam";
import { updateTeam } from "./routes/teams/updateTeam";
import { joinTeam } from "./routes/teams/joinTeam";
import { fetchDiscordUser } from "./routes/discord/fetchDiscordUser";
import { Routes } from "./utils/Routes";

load();

const app = express();

app.set("trust proxy", 1);
app.use(
    express.json({ strict: true }),
    cors({
        credentials: true,
        origin: ["https://simo-botlist.vercel.app", "http://localhost:5173"],
    }),
    cookieParser(),
    (_req, _res, next) => {
        requestCount++;

        next();
    }
);

app.route(Routes.Users)
    .get(getUser)
    .delete(deleteNotification)
    .patch(updateUser);
app.route(Routes.Auth).get(callback);
app.route(Routes.Token).get(getToken).post(createToken);
app.route(Routes.Bots)
    .get(getBot)
    .delete(deleteBotOrFeedback)
    .patch(updateBotOrFeedback)
    .post(createBot);
app.route(Routes.APIStatus).get(getStatus);
app.route(Routes.VoteStatus).get(getVoteStatus);
app.route(Routes.Teams)
    .get(getTeam)
    .post(createTeam)
    .delete(deleteTeam)
    .patch(updateTeam)
    .put(joinTeam);
app.route(Routes.Discord).get(fetchDiscordUser);

export let requestCount = 0;

export let uptime: number;

app.listen(80, async () => {
    uptime = Date.now();

    await connect(process.env.MONGOOSE_URL as string).catch(console.error);

    console.info("API iniciada na porta 80");
});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { Server } from "socket.io";
import { createServer } from "http";
import {
    APIEvents,
    Events,
    Opcodes,
    SocketConnectionStructure,
} from "./typings/types";
import { botModel } from "./models/Bot";
import { GENERICS, SOCKET } from "./utils/errors.json";
import { makeEventData } from "./utils/makeEventData";

const server = createServer(app);
const io = new Server(server);

export const sockets = [] as SocketConnectionStructure[];

io.on("connect", (socket) => {
    sockets.push({
        id: socket.id,
        logged: false,
        data: null,
        socket,
        connected: true,
    });

    socket.on("login", async ({ auth, events }) => {
        const authExists = await botModel.exists({ api_key: auth });

        if (!authExists)
            return socket.emit("event",
                APIEvents[Events.Error],
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: GENERICS.INVALID_AUTH,
                })
            );
        if (
            !Array.isArray(events) ||
            !events.every((event) => Number.isInteger(event))
        )
            return socket.emit("event",
                APIEvents[Events.Error],
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: SOCKET.INVALID_EVENTS,
                })
            );

        const skt = sockets.find((skt) => skt.id === socket.id);

        if (!skt)
            return socket.emit("event",
                APIEvents[Events.Error],
                makeEventData({
                    type: Opcodes.InvalidConnection,
                    payload: SOCKET.UNKNOWN_CONNECTION,
                })
            );

        skt.logged = true;
        skt.data = { auth, events };
    });

    socket.on("disconnect", () => {
        const skt = sockets.find((skt) => skt.id === socket.id);

        if (skt) skt.connected = false;
    });
});
