export const parseQuery = (query: string) => {
    const params = new URLSearchParams(query);
    const result = {} as Record<string, string | number | boolean>;

    for (const [key, value] of params.entries()) {
        const realValue = ["1", "true"].includes(value)
            ? true
            : ["0", "false"].includes(value)
                ? false
                : /^\d+$/.test(value)
                    ? parseInt(value)
                    : value;

        result[key] = realValue;
    }

    return result;
};
