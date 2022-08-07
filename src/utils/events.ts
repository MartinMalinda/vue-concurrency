import {ref} from "./api";
import {IRemoveEvent, Events, IAddEvent, IFireEvent} from "../types/events"

const events: Events = {
    onError: {},
}

export default function globalEvents() { 
    const hasEvent = ({target, key}: IRemoveEvent) => {
        return events[target][key] !== undefined;
    }

    const addEvent = ({target, key, handler}: IAddEvent) => {
        events[target][key] = handler;
    }

    const removeEvent = ({target, key}: IRemoveEvent) => {
        events[target][key] = undefined;
    }

    const clearTargetEvents = ({target}: IRemoveEvent) => {
        events[target] = {};
    }

    const fireEvent = ({target, eventArgs}: IFireEvent) => {
        const eventsToFire = Object.values(events[target]);
        eventsToFire.filter(x => x !== undefined).forEach(x => x!(eventArgs))
    }

    return {
        hasEvent,
        addEvent,
        removeEvent,
        clearTargetEvents,
        fireEvent
    }; 
}
