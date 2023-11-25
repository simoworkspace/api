import { boolean, number, object, string } from "yup";

const idPattern = /^\d{16,21}$/;

export const feedbackValidator = object({
    stars: number().min(1).max(5).required(),
    author: object({
        id: string().matches(idPattern),
        username: string(),
        avatar: string(),
    }),
    content: string().max(500).required(),
    target_bot_id: string().matches(idPattern),
})
    .noUnknown()
    .required();

export const patchFeedbackValidator = object({
    stars: number().min(1).max(5),
    content: string().min(2).max(500),
    reply_message: object({
        content: string().min(2).max(500).required(),
        posted_at: string().required(),
        edited: boolean(),
    }).noUnknown(),
})
    .noUnknown()
    .required()
    .test("at-least-one-key", "You must pass at least one key", (object) => {
        return Object.keys(object).length > 0;
    });
