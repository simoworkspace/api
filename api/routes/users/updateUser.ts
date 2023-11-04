import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER, GENERICS } from "../../helpers/errors.json";
import { userSchema } from "../../models/User";

export const updateUser = async (req: Request, res: Response) => {
    const { body } = req;
    const { userId, method } = req.params;

    if (method)
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    if (typeof body.bio !== "string")
        return res
            .status(HttpStatusCode.BadRequest)
            .json(USER.INVALID_BODY_TO_UPDATE);
    if (body.bio.length > 200 || body.bio.length === 0)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(USER.INVALID_BIO_LENGTH);

    await user.updateOne({ $set: { bio: body.bio } }, { new: true });

    return res.status(HttpStatusCode.Ok).json(user);
};
