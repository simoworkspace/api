import { decode } from "jsonwebtoken";
import { isUsingJWT } from "./isUsingJWT";
import { botSchema } from "../models/Bot";

export const getUserId = async (headers: Record<string, unknown>) => {
    if (!("authorization" in headers)) return null;

    let userId: string | undefined;

    if (isUsingJWT(headers)) {
        const decoded = decode(headers.authorization as string);

        if (typeof decoded === "object" && decoded !== null)
            userId = decoded.id;
    } else
        userId = (await botSchema.findOne({ api_key: headers.authorization }))
            ?.owner_id;

    return userId ?? null;
};
