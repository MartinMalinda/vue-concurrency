import {
  onServerPrefetch,
  getCurrentInstance,
  computed,
} from "./api";
import { TaskInstance } from "../TaskInstance";
import { Task } from "../Task";

const isServer = () => typeof window === "undefined";

export function reviveTaskInstance(instance: TaskInstance<any>) {
  if (instance.isError) {
    instance._deferredObject.promise = Promise.reject(instance.error);
  } else {
    instance._deferredObject.promise = Promise.resolve(instance.value);
  }

  instance.cancel = () => { };
  instance.canceledOn = () => instance;
  instance._run = () => { };
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
        saveTaskToNuxtState(key, task);
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

function saveTaskToNuxtState(key: string, task: Task<any, any>) {
  const { $root } = getCurrentInstance() as any;
  const nuxtState = $root && $root.context && $root.context.nuxtState;
  if (!nuxtState) {
    throw new Error("Could not access $root.context.nuxtState");
  }

  if (!nuxtState.vueConcurrency) {
    nuxtState.vueConcurrency = {};
  }

  nuxtState.vueConcurrency[key] = computed(() => ({
    instances: task._instances,
  }));
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

  return getNuxtData().vueConcurrency[key].value;
}

function deleteTaskCache(key) {
  const nuxtData = getNuxtData();
  delete nuxtData.vueConcurrency[key];
}

export function useSSRPersistance(key: string, task: Task<any, any>) {
  if (isServer()) {
    saveTaskToNuxtState(key, task);
    return;
  }

  reviveTaskInstances(key, task);
}
