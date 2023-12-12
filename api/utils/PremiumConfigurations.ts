import { PremiumType } from "../typings/types";

export const PremiumConfigurations = {
    [PremiumType.Advanced]: {
        cooldown_vote: 2.88e7,
        teams_count: 12,
        bots_count: 12,
    },
    [PremiumType.Basic]: {
        cooldown_vote: 4.32e7,
        teams_count: 6,
        bots_count: 6,
    },
    [PremiumType.None]: {
        cooldown_vote: 4.32e7,
        teams_count: 2,
        bots_count: 2,
    },
};
