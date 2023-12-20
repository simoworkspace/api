import { number, object, string } from "yup";

const idPattern = /^\d{16,21}$/;

export const feedbackValidator = object({
    stars: number()
        .min(1, "Stars must be greater than or equal to 1")
        .max(5, "Stars must be less than or equal to 5")
        .required('"stars" property is missing'),
    content: string()
        .max(500, "Content must be at most 500 characters")
        .required('"content" property is missing'),
    target_bot_id: string().matches(idPattern, "Invalid target bot ID"),
})
    .noUnknown("Unknown property found")
    .required("Empty feedback data received");

export const patchFeedbackValidator = object({
    stars: number()
        .min(1, "Stars must be greater than or equal to 1")
        .max(5, "Stars must be less than or equal to 5"),
    content: string()
        .min(2, "Content must be at least 2 characters")
        .max(500, "Content must be at most 500 characters"),

    reply_message_content: string()
        .min(2, "Reply message content must be at least 2 characters")
        .max(500, "Reply message content must be at most 500 characters"),
})
    .noUnknown("Unknown property found")
    .required("Empty patch feedback data received.")
    .test(
        "at-least-one-key",
        "At least one property must be provided",
        (object) => Object.keys(object).length > 0
    )
    .strict();
