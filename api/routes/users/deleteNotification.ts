import { HttpStatusCode } from "axios";
import { userModel } from "../../models/User";
import type { Request, Response } from "express";
import { GENERICS, USER } from "../../utils/errors.json";
import { getUserId } from "../../utils/getUserId";
import { getSocket } from "../../utils/getSocket";
import { APIEvents, Events } from "../../typings/types";
import { makeEventData } from "../../utils/makeEventData";

export const deleteNotification = async (req: Request, res: Response) => {
    if (req.params.method !== "notifications")
        return res
            .status(HttpStatusCode.MethodNotAllowed)
            .json(GENERICS.METHOD_NOT_ALLOWED);

    const { authorization: auth } = req.headers;

    const userId = await getUserId(auth, res);
    const user = await userModel.findById(userId);

    if (!user)
        return res.status(HttpStatusCode.NotFound).json(USER.UNKNOWN_USER);

    const { notificationId } = req.params;

    const userSocket = getSocket(auth as string);

    if (notificationId === "bulk-delete") {
        if (user.notifications.size < 1)
            return res
                .status(HttpStatusCode.BadRequest)
                .json(USER.NO_NOTIFICATIONS);

        const data = {
            count: user.notifications.size,
            ids: [...user.notifications.keys()],
        };

        user.notifications.clear();

        await user.save();

        if (
            userSocket &&
            userSocket.data?.events.includes(Events.BulkDeleteNotifications)
        )
            userSocket.socket.emit("event",
                APIEvents[Events.BulkDeleteNotifications],
                makeEventData({
                    payload: data,
                    event_type: Events.BulkDeleteNotifications,
                })
            );

        return res.status(HttpStatusCode.Ok).json(data);
    }
    if (!notificationId)
        return res
            .status(HttpStatusCode.BadRequest)
            .json(USER.MISSING_NOTIFICATION_ID);

    const notification = user.notifications.get(notificationId);

    if (!notification)
        return res
            .status(HttpStatusCode.NotFound)
            .json(USER.UNKNOWN_NOTIFICATION);

    const isNotificationDeleted = user.notifications.delete(notificationId);

    await user.save();

    if (
        userSocket &&
        userSocket.data?.events.includes(Events.NotificationDelete)
    )
        userSocket.socket.emit("event",
            APIEvents[Events.NotificationDelete],
            makeEventData({
                event_type: Events.NotificationDelete,
                payload: { ...notification, user_id: userId },
            })
        );

    return res.status(HttpStatusCode.Ok).json(isNotificationDeleted);
};
