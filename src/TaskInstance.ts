import CAF from "caf";
import { computed } from "@vue/composition-api";
import { TaskCb } from "./Task";
import { _reactive, _reactiveContent } from "./utils";

type ThenCb<T> = (value: T) => any;
type CatchCb = (reason: Error) => any;
type onFulfilled<T> = ((value: T) => any) | null | undefined;
type onRejected = ((reason: Error) => any) | null | undefined;
export interface TaskInstance<T> {
  id: number;

  // Lifecycle
  hasStarted: boolean;
  isRunning: boolean;
  isActive: boolean;
  isFinished: boolean;
  isError: boolean;
  isSuccessful: boolean;

  isCancelling: boolean;
  isCanceled: boolean;

  isNotDropped: boolean;
  status: string;

  _run: () => void;
  cancel: () => void;
  token?: Record<string, any>;

  // Concurrency
  isDropped: boolean;
  isEnqueued: boolean;

  // Data State
  value: T | null;
  error: object | null;

  // Promise-like stuff
  _handled: boolean; // this is needed to set to true so that Vue does show error about unhandled rejection
  _resolvers: ThenCb<T>[];
  _rejecters: CatchCb[];
  then: (onfulfilled: onFulfilled<T>, onrejected?: onRejected) => any;
  catch: (onrejected?: onRejected) => any;
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
    isCancelling: false,
    isCanceled: computed(
      () => taskInstance.isCancelling && taskInstance.isFinished
    ),
    isActive: computed(
      () => taskInstance.isRunning && !taskInstance.isCancelling
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
        [t.isDropped, "dropped"],
        [t.isError, "error"],
        [t.isFinished, "finished"],
      ].find(([cond]) => cond) as [boolean, string];
      return match[1];
    }),

    error: null,
    value: null,
    cancel() {
      taskInstance.isCancelling = true;
      taskInstance.isEnqueued = false;

      if (taskInstance.token) {
        taskInstance.token.abort("cancel");
      }
    },
    _run() {
      runTaskInstance(taskInstance, cb, params, options);
    },

    // PromiseLike things. These are necessary so that TaskInstance is `then`able and can be `await`ed

    // Workaround for Vue not to scream because of unhandled rejection. Task is always "handled" because the error is saved to taskInstance.error.
    _handled: true,
    _resolvers: [],
    _rejecters: [],
    then(onFulfilled, onRejected) {
      return promiseWrapAndPushCallbacks(taskInstance, onFulfilled, onRejected);
    },
    catch(onRejected) {
      return new Promise((resolve) => {
        const resolveWrap = wrapCallback(resolve, onRejected);
        // if the taskInstance already errored out, invoke the catch immediately
        if (taskInstance.isError) {
          resolveWrap(taskInstance.error);
        } else {
          // save for later invocation
          taskInstance._rejecters.push(resolveWrap);
        }
      });
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
  const token = new CAF.cancelToken();
  const cancelable = CAF(cb, token);
  taskInstance.token = token;

  taskInstance.hasStarted = true;
  taskInstance.isRunning = true;
  taskInstance.isEnqueued = false;

  function setFinished() {
    taskInstance.isRunning = false;
    taskInstance.isFinished = true;
  }

  cancelable(token, ...params)
    .then((value) => {
      taskInstance.value = value;
      taskInstance.isSuccessful = true;
      setFinished();

      taskInstance._resolvers.forEach((resolveFn) => resolveFn(value));
      options.onFinish(taskInstance);
    })
    .catch((e) => {
      if (e !== "cancel") {
        taskInstance.error = e;
      }

      setFinished();
      taskInstance._rejecters.forEach((rejectFn) => rejectFn(e));
      options.onFinish(taskInstance);
    });
}

function promiseWrapAndPushCallbacks(
  taskInstance: TaskInstance<any>,
  onFulfilled: onFulfilled<any>,
  onRejected: onRejected
) {
  return new Promise((_resolve, _reject) => {
    const resolveWrap = wrapCallback(_resolve, onFulfilled);
    const rejectWrap = wrapCallback(_reject, onRejected);

    // if the task is already error, reject immediately
    if (taskInstance.isError) {
      rejectWrap(taskInstance.error);
      // if the task is already finished, resolve immediately
    } else if (taskInstance.isFinished) {
      resolveWrap(taskInstance.value);
      // else save the callbacks to be invoked later (when the task finishes)
    } else {
      taskInstance._resolvers.push(resolveWrap);
      taskInstance._rejecters.push(rejectWrap);
    }
  });
}

function wrapCallback(
  promiseFn: Function,
  consumerProvidedCb: onFulfilled<any> | onRejected
) {
  return (value) => {
    if (consumerProvidedCb) {
      // TODO: double check this. This wrapping might cause problems for async/await (especially catch)
      // Maybe just use the forwarding to internal promise...
      promiseFn(consumerProvidedCb(value));
    } else {
      promiseFn(value);
    }
  };
}
