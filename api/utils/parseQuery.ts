interface ParseStringQueryOptions {
    parseBooleans?: boolean;
    parseNumbers?: boolean;
    ignoreIds?: boolean;
}

const ID_PATTERN = /^\d{16,21}$/;
const BOOLEAN_PATTERN = /^(0|1|true|false)$/;

export const parseQuery = (
    query: string | Record<string, string>,
    options: ParseStringQueryOptions = {}
) => {
    const params = new URLSearchParams(query);
    const result: Record<string, string | number | boolean> = {};

    for (const [key, value] of params) {
        if (options.ignoreIds && ID_PATTERN.test(value)) {
            result[key] = value;

            continue;
        }

        if (options.parseBooleans && BOOLEAN_PATTERN.test(value)) {
            result[key] = ["1", "true"].includes(value);

            continue;
        }

        if (options.parseNumbers && /^\d+$/.test(value)) {
            result[key] = parseInt(value, 10);

            continue;
        }

        result[key] = value;
    }

    return result;
};
