import { number, object, string } from "yup";

const idPattern = /^\d{16,21}$/;

export const feedbackValidator = object({
    stars: number().required(),
    author: object({
        id: string().matches(idPattern),
        username: string(),
        avatar: string(),
    }),
    content: string().max(500).required(),
    target_bot: string().matches(idPattern),
});

export const patchFeedbackValidator = object({
    stars: number(),
    content: string().min(2).max(500),
});
