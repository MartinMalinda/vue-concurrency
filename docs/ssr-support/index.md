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

This is handled for you if you're using a solution such as [SWRV](https://github.com/Kong/swrv).

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
  useSWRV('/some/api', myTask.perform);

  return {
    myTask
  }
}
```

You can also solve this problem by using a custom caching solution with VueX, Pinia or other centralized store with SSR support. These stores save state created on the server into a `<script>` in HTML which is then picked up and used on the client side:

- [Saving data to store with tasks](/examples/store)

## Performing tasks on the client side only

In other occasions you actually don't want the task to be performed on the server at all, only on the client. Perhaps it's some less critical piece of UI that can load lazily later.

If you're using `Nuxt` you can often solved this by wrapping the whole component with a [`<client-only>`](https://nuxtjs.org/api/components-client-only/) component.

Otherwise, if you need more control, or you're not using Nuxt, you can handling this with `onMounted` hook:

```vue
<script>
export default defineComponent({
  setup() {
    const myTask = useTask(function*() {
      // TODO: check for cache and returned cached result

      return ajax("/some/api");
    });

    onMounted(() => myTask.perform());

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
