import { computed, Ref, watch, reactive } from "./api";
import useTask, { Task } from "../Task";
import { TaskInstance } from "../TaskInstance";
import { AbortSignalWithPromise } from "../types/index";

export function waitForValue<T = any>(cb: () => T): Promise<T> {
  return new Promise((resolve) => {
    const stop = watch(cb, value => {
      if (value !== undefined && value !== null) {
        resolve(value);
        stop && stop();
      }
    }, { immediate: true });
  });
}

export const reachedMaxConcurrency = (task: Task<any, any>): boolean =>
  task._runningInstances.length >= task._maxConcurrency;

export const cancelFirstRunning = (task: Task<any, any>): void => {
  const firstRunningInstance = task._activeInstances[0];
  if (firstRunningInstance) {
    firstRunningInstance.cancel();
  }
};

export const dropEnqueued = (task: Task<any, any>): void => {
  task._enqueuedInstances.forEach((instance) => {
    instance.isEnqueued = false;
    instance.isDropped = true;
  });
};

type BooleanKeys<T> = {
  [k in keyof T]: T[k] extends boolean ? k : never;
}[keyof T];

export function filteredInstances(
  cb: () => Task<any, any>,
  key: BooleanKeys<TaskInstance<any>>
) {
  if (!key) {
    return computed(() => []);
  }

  return computedFilterBy(() => cb()._instances, key);
}

function computedFilterBy<T>(cb: () => T[], key: keyof T, value?: any) {
  return computed(() => {
    const collection = cb();
    return collection.filter((item) => {
      const curr = item[key];
      if (value) {
        return curr === value;
      }

      return curr;
    });
  });
}

export function computedLength(cb: () => any[]): Readonly<Ref<number>> {
  return computed(() => {
    const arr = cb();
    return arr.length;
  });
}

export function computedLastOf<T>(cb: () => readonly T[]): Ref<T | undefined> {
  return computed(() => {
    const collection = cb();
    return collection[collection.length - 1];
  });
}

export function computedFirstOf<T>(
  cb: () => readonly T[]
): Readonly<Ref<T | undefined>> {
  return computed(() => {
    const collection = cb();
    return collection[0];
  });
}

export type Reactive<T> = {
  [K in keyof T]: T[K] extends Ref<infer U> ? U : T[K];
};

export const _reactiveContent = <T>(obj: T) => {
  return obj as Reactive<T>;
};

export function _reactive<T extends object>(obj: T) {
  return reactive(obj) as T;
}

export type DeferredObject<T> = {
  promise: Promise<T>;
  resolve: Function;
  reject: Function;
};
export function defer<T>(): DeferredObject<T> {
  const deferredObject: Record<string, any> = {};
  const promise = new Promise((resolve, reject) => {
    deferredObject.resolve = resolve;
    deferredObject.reject = reject;
  });
  deferredObject.promise = promise as Promise<T>;

  return deferredObject as DeferredObject<T>;
}

export function printTask(task: Task<any, any>) {
  let taskType = "General";

  if (task._isDropping) {
    taskType = "Drop";
  }

  if (task._isEnqueuing) {
    taskType = "Enqueue";
  }

  if (task._isRestartable) {
    taskType = "Restartable";
  }

  if (task._isKeepingLatest) {
    taskType = "KeepLatest";
  }

  let header = `${taskType} Task`;

  if (taskType !== "General") {
    header = `${header} with maxConcurrency ${task._maxConcurrency}`;
  }

  const instanceRows = task._instances.map((instance) => {
    let colorEmoji;

    if (instance.isSuccessful) {
      colorEmoji = "🍏";
    } else if (instance.isRunning || instance.isEnqueued) {
      colorEmoji = "🍊";
    } else if (instance.isError || instance.isCanceled || instance.isDropped) {
      colorEmoji = "🔴";
    }

    const { status, value, error } = instance;
    return { status: `${colorEmoji} ${status}`, value, error };
  });

  console.log(`🚦 ${header}`);
  console.table(instanceRows);
}

export function timeout(time) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getCancelToken<T extends { CancelToken: any }>(
  axios: T,
  signal: AbortSignalWithPromise
) {
  return new axios.CancelToken((cancel) => {
    signal.pr.catch((reason) => {
      if (reason === "cancel") {
        cancel();
      }
    });
  });
}

export function useAsyncTask<T, U extends any[]>(
  fn: (signal: AbortSignalWithPromise, ...params: U) => Promise<T>
) {
  return useTask(function* (signal, ...params: U) {
    return fn(signal, ...params);
  });
}
