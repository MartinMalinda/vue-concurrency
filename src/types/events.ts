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

export type ClearEventParams = {
  target: EventTarget;
};

export type FireEventParams = ClearEventParams & {
  eventArgs: EventArgs;
};

export type RemoveEventParams = ClearEventParams & {
  key: string;
};

export type HasEventParams = RemoveEventParams;

export type AddEventParams = RemoveEventParams & {
  handler: (
    ...eventArgs: unknown[]
  ) => PromiseLike<void> | void | Promise<void>;
};
