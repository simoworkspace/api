import axios, { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import { GENERICS as GenericErrors } from "../../helpers/errors.json";

export const discordWebhook = async (req: Request, res: Response) => {
    if (Object.keys(req.body).length < 1)
        return res
            .status(HttpStatusCode.BadRequest)
            .send(GenericErrors.MISSING_BODY);

    switch (req.params.method) {
    case "addbot": {
        await axios.post(process.env.WEBHOOK_ADDBOT as string, req.body);

        return res
            .status(HttpStatusCode.Ok)
            .send("Message sent successfully to addbot-logs log");
    }
    case "raw": {
        await axios.post(process.env.WEBHOOK_RAW as string, req.body);

        return res
            .status(HttpStatusCode.Ok)
            .send("Message sent successfully to raw logs");
    }
    case "bot": {
        await axios.post(process.env.WEBHOOK_BOT as string, req.body);

        return res
            .status(HttpStatusCode.Ok)
            .send("Message sent successfully to info bot logs");
    }
    case "login": {
        await axios.post(process.env.WEBHOOK_LOGIN as string, req.body);

        return res
            .status(HttpStatusCode.Ok)
            .send("Message sent successfully to login logs");
    }
    default:
        res.status(HttpStatusCode.BadRequest).send("Invalid method");
    }
};
