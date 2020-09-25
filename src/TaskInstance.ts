import CAF from "caf";
import { computed } from "./utils/api";
import { _reactive, _reactiveContent, DeferredObject, defer } from "./utils/general";
import {
  AbortSignalWithPromise,
  TaskCb,
  onFulfilled,
  onRejected,
} from "./types/index";

export type TaskInstanceStatus =
  | "running"
  | "enqueued"
  | "canceled"
  | "canceling"
  | "dropped"
  | "error"
  | "success";
export interface TaskInstance<T> extends PromiseLike<any> {
  id: number;

  // Lifecycle
  hasStarted: boolean;
  isRunning: boolean;
  isActive: boolean;
  isFinished: boolean;
  isError: boolean;
  isSuccessful: boolean;

  isCanceling: boolean;
  isCanceled: boolean;

  isNotDropped: boolean;
  status: TaskInstanceStatus;

  _run: () => void;
  cancel: () => void;
  canceledOn: (signal: AbortSignalWithPromise) => TaskInstance<T>;
  token?: Record<string, any>;

  // Concurrency
  isDropped: boolean;
  isEnqueued: boolean;

  // Data State
  value: T | null;
  error: any | null;

  // Promise-like stuff
  _shouldThrow: boolean;
  _deferredObject: DeferredObject<T>;
  _handled: boolean; // this is needed to set to true so that Vue does show error about unhandled rejection
  then: (onfulfilled: onFulfilled<T>, onrejected?: onRejected) => Promise<any>;
  catch: (onrejected?: onRejected) => any;
  finally: (onfulfilled: () => any) => any;
}

export interface ModifierOptions {
  drop: boolean;
  enqueue: boolean;
}

export interface TaskInstanceOptions {
  id: number;
  modifiers: ModifierOptions;
  onFinish: (taskInstance: TaskInstance<any>) => any;
}

export default function createTaskInstance<T>(
  cb: TaskCb<T, any>,
  params: any[],
  options: TaskInstanceOptions
): TaskInstance<T> {
  // Initial State
  const content = _reactiveContent({
    id: options.id,
    isDropped: false,
    isEnqueued: false,

    hasStarted: false,
    isRunning: false,
    isFinished: false,
    isCanceling: false,
    isCanceled: computed(
      () => taskInstance.isCanceling && taskInstance.isFinished
    ),
    isActive: computed(
      () => taskInstance.isRunning && !taskInstance.isCanceling
    ),
    isSuccessful: false,
    isNotDropped: computed(() => !taskInstance.isDropped),
    isError: computed(() => !!taskInstance.error),
    status: computed(() => {
      const t = taskInstance;
      const match = [
        [t.isRunning, "running"],
        [t.isEnqueued, "enqueued"],
        [t.isCanceled, "canceled"],
        [t.isCanceling, "canceling"],
        [t.isDropped, "dropped"],
        [t.isError, "error"],
        [t.isSuccessful, "success"],
      ].find(([cond]) => cond) as [boolean, TaskInstanceStatus];
      return match && match[1];
    }),

    error: null,
    value: null,
    cancel() {
      taskInstance.isCanceling = true;

      if (taskInstance.isEnqueued) {
        taskInstance.isFinished = true;
      }

      taskInstance.isEnqueued = false;

      if (taskInstance.token) {
        taskInstance.token.abort("cancel");
      }
    },
    canceledOn(signal: AbortSignalWithPromise) {
      signal.pr.catch((e) => {
        taskInstance.cancel();
      });

      return taskInstance;
    },
    _run() {
      runTaskInstance(taskInstance, cb, params, options);
    },

    // PromiseLike things. These are necessary so that TaskInstance is `then`able and can be `await`ed

    // Workaround for Vue not to scream because of unhandled rejection. Task is always "handled" because the error is saved to taskInstance.error.
    _handled: true,
    _deferredObject: defer<T>(),
    _shouldThrow: false, // task throws only if it's used promise-like way (then, catch, await)
    then(onFulfilled, onRejected) {
      taskInstance._shouldThrow = true;
      return taskInstance._deferredObject.promise.then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      taskInstance._shouldThrow = true;
      return taskInstance._deferredObject.promise.catch(onRejected);
    },
    finally(cb) {
      taskInstance._shouldThrow = true;
      return taskInstance._deferredObject.promise.finally(cb);
    },
  });

  // Create
  const taskInstance: TaskInstance<T> = _reactive(content);

  // Process = drop, enqueue or run right away!
  const { modifiers } = options;
  if (modifiers.drop) {
    taskInstance.isDropped = true;
  } else if (modifiers.enqueue) {
    taskInstance.isEnqueued = true;
  } else {
    taskInstance._run();
  }

  return taskInstance;
}

function runTaskInstance<T>(
  taskInstance: TaskInstance<any>,
  cb: TaskCb<T, any>,
  params: any[],
  options: TaskInstanceOptions
): void {
  const token = new (CAF as any).cancelToken();
  const cancelable = (CAF as any)(cb, token);
  taskInstance.token = token;

  taskInstance.hasStarted = true;
  taskInstance.isRunning = true;
  taskInstance.isEnqueued = false;

  function setFinished() {
    taskInstance.isRunning = false;
    taskInstance.isFinished = true;
  }

  cancelable
    .call(taskInstance, token, ...params)
    .then((value) => {
      taskInstance.value = value;
      taskInstance.isSuccessful = true;

      setFinished();
      taskInstance._deferredObject.resolve(value);
      options.onFinish(taskInstance);
    })
    .catch((e) => {
      if (e !== "cancel") {
        taskInstance.error = e;
      }

      setFinished();
      if (taskInstance._shouldThrow) {
        taskInstance._deferredObject.reject(e);
      }
      options.onFinish(taskInstance);
    });
}
