import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER, GENERICS } from "../../utils/errors.json";
import { userModel } from "../../models/User";
import { updateUserValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";
import { isDifferent } from "../../utils/isDifferent";

export const updateUser = async (req: Request, res: Response) => {
    const userId = await getUserId(req.headers.authorization, res);

    if (typeof userId !== "string") return;

    const { method } = req.params;

    if (method)
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const user = await userModel.findById(userId);

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
    if (!isDifferent(user._doc, body))
        return res
            .status(HttpStatusCode.BadRequest)
            .json(GENERICS.UPDATE_VALUE_ERROR);

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true }
    );

    return res.status(HttpStatusCode.Ok).json(updatedUser);
};
