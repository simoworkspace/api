import cors from "cors";
import { load } from "env-smart";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import { auth } from "./middlewares/auth";
import { default as express } from "express";
import { getBot } from "./routes/bots/getBot";
import { PORT, ROUTES } from "../constants.json";
import { getUser } from "./routes/users/getUser";
import { getToken } from "./routes/auth/getToken";
import { callback } from "./routes/auth/callback";
import { createBot } from "./routes/bots/createBot";
import { getGuild } from "./routes/guilds/getGuild";
import { createGuild } from "./routes/guilds/createGuild";
import { updateGuild } from "./routes/guilds/updateGuild";
import { deleteGuild } from "./routes/guilds/deleteGuild";
import { discordWebhook } from "./routes/webhooks/discordWebhook";
import { createNotification } from "./routes/users/createNotification";
import { deleteNotification } from "./routes/users/deleteNotification";
import { updateBotOrFeedback } from "./routes/bots/updateBotOrFeedback";
import { deleteBotOrFeedback } from "./routes/bots/deleteBotOrFeedback";

load();

const app = express();

app.set("trust proxy", 1);
app.use(
    express.json({ strict: true }),
    cors({
        credentials: true,
        origin: ["https://simo-botlist.vercel.app", "http://localhost:5173"],
    }),
    cookieParser()
);

app.route(ROUTES.USER)
    .get(getUser)
    .post(createNotification)
    .delete(deleteNotification);
app.route(ROUTES.AUTH).get(callback);
app.route(ROUTES.TOKEN).get(getToken);
app.route(ROUTES.WEBHOOK).post(auth, discordWebhook);
app.route(ROUTES.BOTS)
    .get(getBot)
    .delete(auth, deleteBotOrFeedback)
    .patch(auth, updateBotOrFeedback)
    .post(auth, createBot);
app.route(ROUTES.GUILD)
    .get(getGuild)
    .delete(auth, deleteGuild)
    .patch(auth, updateGuild)
    .post(auth, createGuild);

app.listen(PORT, async () => {
    await connect(process.env.MONGOOSE_URL as string).catch(console.error);

    console.info(`API iniciada na porta ${PORT}`);
});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);