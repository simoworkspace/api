import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER, GENERICS } from "../../utils/errors.json";
import { userSchema } from "../../models/User";
import { updateUserValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";

export const updateUser = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const { method } = req.params;

    if (method)
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const user = await userSchema.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { body } = req;

    const validation = await updateUserValidator
        .validate(body)
        .catch((error) => error.errors);

    if (Array.isArray(validation))
        return res
            .status(HttpStatusCode.BadRequest)
            .json({ errors: validation });

    const updatedUser = await userSchema.findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(updatedUser);
};
