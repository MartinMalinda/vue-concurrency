import { Task } from "../Task";

export interface AbortSignalWithPromise extends AbortSignal {
  pr: Promise<void>;
}

export type Resolved<T> = T extends PromiseLike<infer U> ? U : T;
export type YieldReturn<T> = T extends Task<infer U, any>
  ? U
  : Resolved<ReturnType<T extends (...args: any) => any ? T : any>>;

export type TaskCb<T, U extends any[]> = (
  signal: AbortSignalWithPromise,
  ...params: U
) => Generator<any, T, any>;

export type onFulfilled<T> = ((value: T) => any) | null | undefined;
export type onRejected = ((reason: any) => any) | null | undefined;
