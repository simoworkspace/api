import { verify } from "jsonwebtoken";

export const isUsingJWT = (headers: Record<string, unknown>) => {
    try {
        verify(
            headers.authorization as string,
            process.env.JWT_SECRET as string
        );

        return true;
    } catch (err) {
        return false;
    }
};
