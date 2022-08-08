import { TaskInstance } from "../TaskInstance";

export const EventTargetOptions = {
  OnError: "onError",
} as const;

export type EventTarget =
  typeof EventTargetOptions[keyof typeof EventTargetOptions];

export type EventArgs = {
  sender: TaskInstance<any>;
  params?: any[];
  error?: unknown;
  data?: unknown;
};

export type Events = {
  [key in EventTarget]: Record<
    string,
    | ((eventArgs: EventArgs) => PromiseLike<void> | void | Promise<void>)
    | undefined
  >;
};

export type ClearEventHandlerParams = {
  target: EventTarget;
};

export type FireEventHandlerParams = ClearEventHandlerParams & {
  eventArgs: EventArgs;
};

export type RemoveEventHandlerParams = ClearEventHandlerParams & {
  key: string;
};

export type HasEventHandlerParams = RemoveEventHandlerParams;

export type AddEventHandlerParams = RemoveEventHandlerParams & {
  handler: (
    ...eventArgs: unknown[]
  ) => PromiseLike<void> | void | Promise<void>;
};
