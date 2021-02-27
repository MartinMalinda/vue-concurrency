import {
  onServerPrefetch,
  getCurrentInstance,
  onBeforeMount,
  computed,
} from "@nuxtjs/composition-api";

async function wrap (func, catcher, finaliser) {
  try {
    return await func();
  } catch (e) {
    if (catcher) await catcher(e);
  } finally {
    if (finaliser) await finaliser();
  }
}

function getNuxtTask (key) {
  const ssrContext = process.client && window['__NUXT__'];

  if (!ssrContext)
    throw Error(`Could not access window.__NUXT__ or not operating client-side`);

  if (!ssrContext.vueConcurrency || !ssrContext.vueConcurrency[key])
    return undefined;

  return ssrContext.vueConcurrency[key].value;
}

function setNuxtTask (vm, key, task) {
  const { nuxt: ssrContext } = vm.$ssrContext;

  if (!ssrContext.vueConcurrency)
    ssrContext.vueConcurrency = {};

  ssrContext.vueConcurrency[key] = computed(() => task._instances);
}

export function reviveTaskInstance (instance) {
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

function reviveTaskInstances (key, task) {
  const taskCache = getNuxtTask(key);

  if (taskCache) {
    task._instances = taskCache || [];
    task._instances.forEach(reviveTaskInstance);
  }
}

export function useTaskPrefetch (key, task) {
  const vm = getCurrentInstance();

  onServerPrefetch(async () => {
    await wrap(task.perform);
    setNuxtTask(vm, key, task);
  });

  if (process.client) {
    onBeforeMount(async () => !task._instances.length && task.perform());
    reviveTaskInstances(key, task);
  }

  return task;
}

export function useSSRPersistance (key, task) {
  const vm = getCurrentInstance();
  if (process.server) setNuxtTask(vm, key, task);
  else reviveTaskInstances(key, task);
}
