import { onServerPrefetch, getCurrentInstance } from "@vue/composition-api";
import { TaskInstance } from "./TaskInstance";
import { Task } from "./Task";

const isServer = () => typeof window === "undefined";

export function reviveTaskInstance(instance: TaskInstance<any>) {
  if (instance.isError) {
    instance._deferredObject.promise = Promise.reject(instance.error);
  } else {
    instance._deferredObject.promise = Promise.resolve(instance.value);
  }

  instance.cancel = () => {};
  instance.canceledOn = () => instance;
  instance._run = () => {};
  instance.then = (...params) =>
    instance._deferredObject.promise.then(...params);
  instance.catch = (...params) =>
    instance._deferredObject.promise.catch(...params);
  instance.finally = (...params) =>
    instance._deferredObject.promise.finally(...params);
}

export function useTaskPrefetch<T>(
  key: string,
  task: Task<T, any>
): TaskInstance<T> {
  /* Server */

  if (isServer()) {
    // perform, add to prefetch, add to ssrContext
    const taskInstance = task.perform();
    onServerPrefetch(async () => {
      try {
        await taskInstance;
        saveTaskToSSRContext(key, task);
      } catch (e) {
        // no need for extra handling
      }
    });
    return taskInstance;
  }

  /* Client */
  const [last] = reviveTaskInstances(key, task).reverse();

  if (last) {
    return last;
  } else {
    return task.perform();
  }
}

function saveTaskToSSRContext(key: string, task: Task<any, any>) {
  const { $ssrContext } = getCurrentInstance() as any;
  if (!$ssrContext) {
    throw new Error("Could not access $ssrContext");
  }

  if ($ssrContext?.nuxt) {
    if (!$ssrContext.nuxt.vueConcurrency) {
      $ssrContext.nuxt.vueConcurrency = {};
    }

    $ssrContext.nuxt.vueConcurrency[key] = { instances: task._instances };
  }
}

function reviveTaskInstances(key: string, task: Task<any, any>) {
  const taskCache = getTaskFromContext(key);
  if (taskCache) {
    task._instances = taskCache.instances || [];
    task._instances.forEach(reviveTaskInstance);
    deleteTaskCache(key);
  }

  return task._instances;
}

function getNuxtData() {
  return (window as any).__NUXT__;
}

function getTaskFromContext(key) {
  if (!getNuxtData()) {
    throw Error(`Could not access  window.__NUXT__`);
  }

  return getNuxtData().vueConcurrency[key];
}

function deleteTaskCache(key) {
  const nuxtData = getNuxtData();
  delete nuxtData.vueConcurrency[key];
}

export function useSSRPersistance(key: string, task: Task<any, any>) {
  if (isServer()) {
    saveTaskToSSRContext(key, task);
    return;
  }

  reviveTaskInstances(key, task);
}
