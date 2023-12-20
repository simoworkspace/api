import { AnyEventData, Opcodes } from "../typings/types";

export const makeEventData = (data: Partial<AnyEventData>) => {
    return {
        type: Opcodes.Payload,
        event_type: null,
        ...data,
    };
};
