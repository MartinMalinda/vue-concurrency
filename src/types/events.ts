
import { TaskInstance } from "../TaskInstance";

export const EventTargetOptions = {
    OnError: "onError",
} as const;

export type EventTarget = typeof EventTargetOptions[keyof typeof EventTargetOptions];

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