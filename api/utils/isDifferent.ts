import { updatedDiff } from "deep-object-diff";

export const isDifferent = (obj1: object, obj2: object) =>
    Object.keys(updatedDiff(obj1, obj2)).length > 0;
