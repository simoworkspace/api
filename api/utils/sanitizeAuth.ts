export const sanitizeAuth = (auth: string) =>
    auth.startsWith("Bot") ? auth.slice(4) : auth.slice(5);
