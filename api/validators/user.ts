import { boolean, number, object, string } from "yup";
import { Locales, NotificationType } from "../typings/types";
import { isImage } from "../utils/isImage";

export const createNotificationValidator = object({
    content: string()
        .required("\"content\" property is missing")
        .min(1, "Feedback content can't be empty"),
    type: number()
        .oneOf(
            [
                NotificationType.ApprovedBot,
                NotificationType.Comment,
                NotificationType.Mixed,
                NotificationType.RefusedBot,
            ],
            "Invalid feedback type"
        )
        .required("\"type\" property is missing"),
    url: string().url("Invalid feedback URL"),
})
    .strict()
    .required("Empty notification data received")
    .noUnknown("Unknown property found")
    .test("valid-url-with-type", "URL can only be used for comments", (notf) =>
        notf.url ? notf.type === NotificationType.Comment : true
    );

export const updateUserValidator = object({
    bio: string()
        .max(200, "Biography must be less than or equal to 200")
        .min(1, "Biography must be greater than or equal to 1"),
    notifications_viewed: boolean(),
    banner_url: string()
        .url("Invalid banner URL")
        .test("valid-image-url", "Not a well-formed image URL", async (url) => {
            return url ? await isImage(url) : true;
        }),
    locale: string().oneOf(
        [Locales.EnglishUS, Locales.PortugueseBr, Locales.Spanish],
        "Invalid language name"
    ),
})
    .noUnknown("Unknown property found")
    .strict()
    .test(
        "at-least-one-key",
        "At least one property must be provided",
        (object) => {
            return Object.keys(object).length > 0;
        }
    );
