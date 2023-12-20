import { sockets } from "..";
import { sanitizeAuth } from "./sanitizeAuth";

export const getSocket = (auth: string) => {
    const socket = sockets.find(
        (socket) =>
            socket.connected &&
            socket.logged &&
            socket.data?.auth === sanitizeAuth(auth)
    );

    return socket;
};
