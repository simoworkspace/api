import { HttpStatusCode } from "axios";
import { FEEDBACK } from "../../utils/errors.json";
import type { Request, Response } from "express";
import { feedbackModel } from "../../models/Feedback";
import { userModel } from "../../models/User";

export const fetchBotFeedbacks = async (req: Request, res: Response) => {
    const feedbacks = await feedbackModel.find({
        target_bot_id: req.params.id,
    });

    if (!feedbacks || feedbacks.length < 1)
        return res.status(HttpStatusCode.NoContent).json(FEEDBACK.NO_FEEDBACKS);

    return Promise.all(
        feedbacks.map(
            async ({
                stars,
                author_id,
                content,
                target_bot_id,
                edited,
                reply_message,
                posted_at,
            }) => {
                const author = await userModel.findById(author_id, {
                    username: 1,
                    avatar: 1,
                });

                return {
                    stars,
                    content,
                    target_bot_id,
                    edited,
                    reply_message,
                    author: {
                        username: author?.username,
                        avatar: author?.avatar,
                        id: author_id,
                    },
                    posted_at,
                };
            }
        )
    ).then((result) => res.status(HttpStatusCode.Ok).json(result));
};
