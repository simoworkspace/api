import { object, string, array, boolean } from "yup";

export const botSchemaValidator = object({
    invite_url: string()
        .url("Invalid invite URL")
        .required("\"invite_url\" property is missing"),
    website_url: string().url("Invalid website URL"),
    support_server: string().matches(
        /^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i,
        "Invalid support server URL"
    ),
    source_code: string().url("Invalid source code URL"),
    short_description: string()
        .min(50, "Short description must be greater than or equal to 50")
        .max(80, "Short description must be less than or equal to 80")
        .required("\"short_description\" property is missing"),
    long_description: string()
        .min(200, "Long description must be greater than or equal to 200")
        .max(2048, "Long description must be less than or equal to 2048")
        .required("\"long_description\" property is missing"),
    prefixes: array(
        string().max(6, "Prefix name must be less than or equal to 6")
    )
        .max(5, "Prefix limit excedded")
        .required("\"prefixes\" property is missing")
        .test(
            "no-equal-prefix",
            "Cannot have 2 same prefixes",
            (prefixes) => prefixes && new Set(prefixes).size === prefixes.length
        ),
    verified: boolean().required("\"verified\" property is missing"),
    tags: array(
        string().max(24, "Invalid tag name, must be maximum 24 characters long")
    )
        .max(5, "Tags limit excedded")
        .required("\"tags\" property is missing")
        .test(
            "no-equal-tag",
            "Cannot have 2 same tags",
            (tags) => new Set(tags).size === tags.length
        )
        .test(
            "valid-tag",
            "Invalid tag name found, the tag must match \"/^[\\w\\-À-ÿ]+$/u\"",
            (tags) => tags.every((tag) => tag && /^[\w\-À-ÿ]+$/u.test(tag))
        )
        .test("no-promoted", "Promoted tag can't be used", (tags) =>
            tags ? tags.every((tag) => tag !== "promoted") : true
        ),
    vote_message: string()
        .min(5, "Vote message must be greater than or equal to 5")
        .max(30, "Vote message must be less than or equal to 30"),
    webhook_url: string().url("Invalid webhook URL"),
})
    .strict()
    .required("Empty bot data")
    .noUnknown("Unknown property found");

export const patchBotValidator = object({
    name: string(),
    avatar: string(),
    invite_url: string().url("Invalid invite URL"),
    website_url: string().url("Invalid website URL"),
    support_server: string().matches(
        /^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i,
        "Invalid support server URL"
    ),
    source_code: string().url("Invalid source code URL"),
    short_description: string()
        .min(50, "Short description must be greater than or equal to 50")
        .max(80, "Short description must be less than or equal to 80"),
    long_description: string()
        .min(200, "Long description must be greater than or equal to 200")
        .max(2048, "Long description must be less than or equal to 2048"),
    prefixes: array(
        string().max(6, "Prefix name must be less than or equal to 6")
    )
        .max(5, "Prefix limit excedded")
        .test("no-equal-prefix", "Cannot have 2 same prefixes", (prefixes) =>
            prefixes ? new Set(prefixes).size === prefixes.length : true
        ),
    verified: boolean(),
    tags: array(
        string().max(24, "Invalid tag name, must be maximum 24 characters long")
    )
        .min(1, "A bot must have at least 1 tag")
        .max(5, "Tags limit excedded")
        .test("no-equal-tag", "Cannot have 2 same tags", (tags) =>
            tags ? new Set(tags).size === tags.length : true
        )
        .test(
            "valid-tag",
            "Invalid tag name found, the tag must match \"/^[\\w\\-À-ÿ]+$/u\"",
            (tags) =>
                tags
                    ? tags.every((tag) => tag && /^[\w\-À-ÿ]+$/u.test(tag))
                    : true
        )
        .test("no-promoted", "Promoted tag can't be used", (tags) =>
            tags ? tags.every((tag) => tag !== "promoted") : true
        ),
    vote_message: string()
        .min(5, "Vote message must be greater than or equal to 5")
        .max(30, "Vote message must be less than or equal to 30"),
    webhook_url: string().url("Invalid webhook URL"),
})
    .strict()
    .required("Empty bot data")
    .noUnknown("Unknown property found")
    .test(
        "at-least-one-key",
        "At least one property must be provided",
        (object) => {
            return Object.keys(object).length > 0;
        }
    );
