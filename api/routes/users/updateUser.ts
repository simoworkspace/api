import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { USER, GENERICS } from "../../utils/errors.json";
import { userModel } from "../../models/User";
import { updateUserValidator } from "../../validators/user";
import { getUserId } from "../../utils/getUserId";
import { APIEvents, Events } from "../../typings/types";
import { getSocket } from "../../utils/getSocket";
import { makeEventData } from "../../utils/makeEventData";

export const updateUser = async (req: Request, res: Response) => {
    const { authorization: auth } = req.headers;
    const userId = await getUserId(auth, res);

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

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: body },
        { new: true, projection: { __v: 0 } }
    );

    const userSocket = getSocket(auth as string);

    if (userSocket && userSocket.data?.events.includes(Events.UserUpdate))
        userSocket.socket.emit("event",
            APIEvents[Events.UserUpdate],
            makeEventData({
                event_type: Events.UserUpdate,
                payload: updatedUser,
            })
        );

    return res.status(HttpStatusCode.Ok).json(updatedUser);
};
