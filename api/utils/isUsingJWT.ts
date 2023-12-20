import { verify } from "jsonwebtoken";

export const isUsingJWT = (auth: string) => {
    try {
        verify(auth, process.env.JWT_SECRET as string);

        return true;
    } catch (err) {
        return false;
    }
};
