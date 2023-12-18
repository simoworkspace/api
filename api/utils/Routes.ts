export const Routes = {
    Bots: "/api/bots/:id(\\d{16,21})?(/:method(votes|feedbacks|api-key|webhook))?(/:wmethod)?",
    Users: "/api/users/:method?(/:notificationId(\\d+|bulk-delete))?",
    Auth: "/api/auth/:method(callback|user|logout)",
    Token: "/api/auth/:method(api-key|token)(/:botId)?",
    APIStatus: "/api/status",
    VoteStatus: "/api/vote-status/:userId",
    Teams: "/api/teams/:teamId?/:inviteCode?/:targetId?",
    Discord: "/api/discord-user/:userId(\\d+)",
};
