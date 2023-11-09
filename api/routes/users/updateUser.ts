import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER, GENERICS } from "../../helpers/errors.json";
import { userSchema } from "../../models/User";
import { updateUserValidator } from "../../validators/user";

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

    const validation = await updateUserValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    await user.updateOne({ $set: body }, { new: true });

    return res.status(HttpStatusCode.Ok).json(user);
};
