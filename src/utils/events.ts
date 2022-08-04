import {ref, readonly} from "./api";
import { TaskInstance } from "../TaskInstance";

export enum EventTarget {
    OnError = "onError",
}

export interface IEventArgs {
    sender: TaskInstance<any>,
    params?: any[],
    error?: unknown,
    data?: unknown
}

export type Events = {
    [key in EventTarget]: Record<string, ((eventArgs: IEventArgs) => PromiseLike<void> | void | Promise<void>) | undefined>;
};

export interface IClearEvents {
    target: EventTarget,
}

export interface IFireEvent extends IClearEvents {
    eventArgs: IEventArgs
}

export interface IRemoveEvent extends IClearEvents {
    key: string,
}

export interface IAddEvent extends IRemoveEvent {
    handler: (...eventArgs: unknown[]) => PromiseLike<void> | void | Promise<void>
}

const events = ref<Events>({
    onError: {},
})

export default function globalEvents() { 
    const hasEvent = ({target, key}: IRemoveEvent) => {
        return events.value[target][key] !== undefined;
    }

    const addEvent = ({target, key, handler}: IAddEvent) => {
        events.value[target][key] = handler;
    }

    const removeEvent = ({target, key}: IRemoveEvent) => {
        events.value[target][key] = undefined;
    }

    const clearTargetEvents = ({target}: IRemoveEvent) => {
        events.value[target] = {};
    }

    const fireEvent = ({target, eventArgs}: IFireEvent) => {
        const eventsToFire = Object.values(events.value[target]);
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
