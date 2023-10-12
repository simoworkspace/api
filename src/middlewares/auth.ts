import { verify } from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { GENERICS } from "../routers/helpers/errors.json";
import { Request, Response, NextFunction } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const jwtToken = req.headers.authorization as string;

    if (jwtToken) {
        try {
            const jwtSecrect = process.env.JWT_SECRET as string;

            verify(jwtToken, jwtSecrect);

            next();
        } catch {
            return res
                .status(HttpStatusCode.BadRequest)
                .json(GENERICS.INVALID_AUTH);
        }
    }
};
