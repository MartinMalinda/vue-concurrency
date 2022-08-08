import {RemoveEventParams, Events, AddEventParams, FireEventParams, ClearEventParams, HasEventParams} from "../types/events"

const events: Events = {
    onError: {},
}


export function hasEventHandler ({target, key}: HasEventParams) {
    return events[target][key] !== undefined;
}

export function addEventHandler ({target, key, handler}: AddEventParams) {
    events[target][key] = handler;
}

export function removeEventHandler ({target, key}: RemoveEventParams) {
    events[target][key] = undefined;
}

export function clearTargetEventHandlers ({target}: ClearEventParams) {
    events[target] = {};
}

export function fireEvent ({target, eventArgs}: FireEventParams) {
    const eventsToFire = Object.values(events[target]);
    eventsToFire.filter(x => x !== undefined).forEach(x => x!(eventArgs))
}
