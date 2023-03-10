
import CAF, { cancelToken } from "caf";
import { computed, EffectScope } from "./utils/api";
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
export interface TaskInstance<T> extends PromiseLike<T> {
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
  cancel: (options?: { force: boolean }) => void;
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
  _canAbort: boolean;
  _deferredObject: DeferredObject<T>;
  _handled: boolean; // this is needed to set to true so that Vue does not show error about unhandled rejection
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
  scope: EffectScope,
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
    cancel({ force } = { force: false }) {
      if (!force) {
        taskInstance.isCanceling = true;

        if (taskInstance.isEnqueued) {
          taskInstance.isFinished = true;
        }

        taskInstance.isEnqueued = false;
      }

      if (taskInstance.token && taskInstance._canAbort) {
        taskInstance.token.abort("cancel");
        try {
          taskInstance.token.discard();
        } catch (e) {
          // this can cause an error where AbortSignal cannot be changed
          // perhaps browsers consider it to be immutable
          // all in all, failed token discard is no big deal, the memory saved is not that big
        }
        taskInstance.token = undefined;
        taskInstance._canAbort = false;
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
    _canAbort: true,
    then(onFulfilled, onRejected) {
      taskInstance._shouldThrow = true;
      return taskInstance._deferredObject.promise.then(onFulfilled, onRejected);
    },
    catch(onRejected, shouldThrow = true) {
      taskInstance._shouldThrow = shouldThrow;
      return taskInstance._deferredObject.promise.catch(onRejected);
    },
    finally(cb) {
      taskInstance._shouldThrow = true;
      return taskInstance._deferredObject.promise.finally(cb);
    },
  });

  // Create
  const taskInstance = _reactive(content) as TaskInstance<T>;

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
  // because not all environemnts support package.exports field (TS, WP4 and others), it's necessary to look for CAF function in two places
  const token = new cancelToken();
  const cancelable = CAF(cb, token);
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
      taskInstance._canAbort = false;
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
