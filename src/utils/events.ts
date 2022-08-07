import {RemoveEventParams, Events, AddEventParams, FireEventParams, ClearEventParams, HasEventParams} from "../types/events"

const events: Events = {
    onError: {},
}

export default function globalEvents() { 
    const hasEventHandler = ({target, key}: HasEventParams) => {
        return events[target][key] !== undefined;
    }

    const addEventHandler = ({target, key, handler}: AddEventParams) => {
        events[target][key] = handler;
    }

    const removeEventHandler = ({target, key}: RemoveEventParams) => {
        events[target][key] = undefined;
    }

    const clearTargetEventHandlers = ({target}: ClearEventParams) => {
        events[target] = {};
    }

    const fireEvent = ({target, eventArgs}: FireEventParams) => {
        const eventsToFire = Object.values(events[target]);
        eventsToFire.filter(x => x !== undefined).forEach(x => x!(eventArgs))
    }

    return {
        hasEventHandler,
        addEventHandler,
        removeEventHandler,
        clearTargetEventHandlers,
        fireEvent
    }; 
}
