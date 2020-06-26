---
sidebarDepth: 0
---

# Using with SSR

If you're using SSR and you're perfoming tasks right away, most commonly to fetch data from an API, chances are, you want the server wait for the task to finish before sending back HTML.

The basic way to make the server wait for a task to finish is quite simple by using the `onServerPrefetch` hook.

```ts
setup() {
  const myTask = useTask(function*() {
    // TODO: check for cache and returned cached result

    return ajax('/some/api');
  });

  const taskInstance = task.perform();
  onServerPrefetch(() => taskInstance);

  return {
    myTask
  }
}
```

The task is performed right away, running whatever ajax logic needed, but on top of that the instance is added to the `onServerPrefetch` hook. Because the TaskInstance is PromiseLike, the hook can add a callback and wait for it to finish.

In a real world scenario the code example above would not be optimal because the task would be fired both on the server and also on the client, making the AJAX request twice. This problem is not specific to `vue-concurrency` but to SSR in general and to avoid it, it's necessary to efficiently transfer the state from the server to the client and use cache.

## With vue-concurrency SSR utils

Vue concurrency comes with (experimental) SSR utils to help solve these issues. At the moment they assume your SSR solution is Nuxt. There's two hooks: `useTaskPrefetch` and `useSSRPersistence`.

```ts
import { useTaskPrefetch } from 'vue-concurrency';

// ...

setup() {
  const myTask = useTask(function*() {
    return ajax('/some/api');
  });
  useTaskPrefetch('some-cache-key', myTask);

  return {
    myTask
  }
}
```

`useTaskPrefetch` has the same philosophy as `Fetch` in Nuxt. If called on the server, it performs the task and saves the result to the cache. Actually it saves the whole task with all the instances. On the client, the task instances are recovered. `task.last` therefore is the instance that was performed on the server. If there's no `task.last` the task is performed on the client. That covers cases of client side transitions.

If the task calls other tasks, you might need to do `useSSRPersistance` on those. This hook makes sure the task is serialized on the server and recovered on the client but it doesn't do any performing for you.

Both of these require a cache key. It can be any unique string.

```ts
import { useTaskPrefetch, useSSRPersistance } from 'vue-concurrency';

// ...

setup() {
  const otherTask = useTask(function*() {
    return ajax('/foo/bar');
  });
  useSSRPersistance('other-task', otherTask);
  const mainTask = useTask(function*() {
    yield otherTask.perform();
    return ajax('/some/api');
  });
  useTaskPrefetch('main-task', myTask);

  return {
    myTask,
    otherTask
  }
}
```

::: warning
These utils are an experimental feature and might change in the future. They also assume your tasks don't have side-effects like setting refs. If the task works via setting a ref, you might need to use [ssrRef](https://composition-api.now.sh/helpers/ssrRef.html) from [nuxt/composition-api](https://composition-api.now.sh/).
:::

## With Nuxt Composition API

If you use Nuxt, you might use [useAsync](https://composition-api.now.sh/helpers/useAsync.html) or `useFetch` hook from [nuxt/composition-api](https://composition-api.now.sh/).

```ts
const data = useAsync(myTask.perform);

return { data, myTask };
```

The problem in this case is that while `data` will sufficiently contain the data from SSR, the rest of the task state will be out of sync - `task.last`, `task.isError` and so on. There's a `ssrPromise` that is designed to solve this problem:

```ts
const data = ssrPromise(() => ajax("/api/users"));
const task = useTask(function*() {
  return data;
});
```

## With SWRV

[SWRV](https://github.com/Kong/swrv) can be a reasonable alternative but it has the same downside of `data` being out of sync with task state.

```ts
import useSWRV from 'swrv';

/* ... */

setup() {
  const GET_USERS = '/api/users';
  const myTask = useTask(function*() {
    // TODO: check for cache and returned cached result

    return ajax(GET_USERS);
  });

  // useSWRV accetps a key and a promise returning function; myTask.perform is a function returning TaskInstance which is a PromiseLike object and therefore suffices
  const data = useSWRV('/some/api', myTask.perform);

  return {
    myTask,
    data
  }
}
```

You can also solve this problem by using a custom caching solution with VueX, Pinia or other centralized store with SSR support. These stores save state created on the server into a `<script>` in HTML which is then picked up and used on the client side:

- [Saving data to store with tasks](/examples/store)

## Performing tasks on the client side only

In other occasions you actually don't want the task to be performed on the server at all, only on the client. Perhaps it's some less critical piece of UI that can load lazily later.

If you're using `Nuxt` you can often solved this by wrapping the whole component with a [`<client-only>`](https://nuxtjs.org/api/components-client-only/) component.

Otherwise, if you need more control, or you're not using Nuxt, you can handling this with `onBeforeMounted` hook:

```vue
<script>
export default defineComponent({
  setup() {
    const myTask = useTask(function*() {
      // TODO: check for cache and returned cached result

      return ajax("/some/api");
    });

    onBeforeMounted(() => myTask.perform());

    return {
      myTask,
    };
  },
});
</script>
<template>
  <div>
    <div v-if="!myTask.performCount">
      Task not performed yet. This means this is SSR. Display a spinner, or
      maybe nothing?
    </div>
    <div v-else-if="myTask.isRunning">
      Task is running on the client side. Display spinner?
    </div>
    <div v-else>Finally some data: {{ task.last.value }}</div>
  </div>
</template>
```
