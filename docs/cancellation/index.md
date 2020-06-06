---
sidebarDepth: 0
---

# Cancelation

Because tasks utilize generator functions, they are cancelable. That prevents unnecessary work, makes them safe to use and allows new (easier) ways solve problems.

Tasks are canceled automatically when the component they exist on is unmounted or with the usage of a `task.restartable()` concurrency policy.  
They can be also canceled explicitly via methods like `taskInstance.cancel()` or `task.cancelAll()`.

## Example

Let's create a task that periodically polls the server every 5s. With the possibility of cancelation, we don't have to use recursions or defensive guards. It's possible to create a task with an infinite loop and rely on cancelation.

```ts
setup() {
  const latestData = ref(null);
  const getLatestTask = useTask(function*() {
    while (true) {
      latestData.value = yield get('/api/news');
      yield timeout(5000); // wait 5s
    }
  }).drop();
  // 👆such a task is fine to do. It will get canceled when the component is unmounted.
  getLatestTask.perform(); // start polling right away

  // if needed, you can pass methods to pause and resume the task to the template
  function pause() {
    getLatestTask.cancelAll();
  }

  function resume() {
    // a plain perform like that is safe because the task is set to `drop()`
    // therefore it won't start a new instance if it's already running
    getLatestTask.perform();
  }

  return { getLatestTask, pause, resume };
}
```

## Aborting Network Requests

`vue-concurrency` uses [CAF](https://github.com/getify/CAF) under the hood for the actual cancelation. When a task is performed, an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) is passed as the first argument to the generator function. This signal object can be passed to [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) so that when a task is canceled the associated network requests are aborted. This saves browser some work and frees memory.

To make aborting work, we need to pass the signal to the right place:

```ts
const getUserTask = useTask(function*(signal, id) {
  const response = yield fetch(`/api/users/${id}`, { signal });
  return response.json();
});
```

### Axios

Such `AbortSignal` works with `fetch` right out of the box. To cancel with `Axios` you can use a promise that is placed on the abort signal:

```ts
const getUserTask = useTask(function*(signal, id) {
  yield $axios(`/api/users/${id}`, {
    cancelToken: new $axios.CancelToken((cancel) => {
      signal.pr.catch((reason) => {
        if (reason === "cancel") {
          cancel();
        }
      });
    }),
  });
});
```

(`AbortSignal` by itself does not have this `pr` promise present. It's been placed there by CAF. That's why `vue-c` uses type `AbortSignalWithPromise` for this object).

Because `Axios` is frequently used with Vue apps, `vue-concurrency` provides a helper function that does exactly what's been shown above.

```ts
import { getCancelToken } from 'vue-concurrency';

setup() {
  const getUserTask = useTask(function*(signal, id) {
    yield $axios(`/api/users/${id}`, {
      cancelToken: getCancelToken($axios, signal);
    });
  });
}
```

## Cancelation Cascade

If a task (main task), performs different tasks (child tasks) and gets canceled, even the child tasks should get canceled.

This cascade of cancelation is possible via `taskInstance.canceledOn()`.

```ts
const searchTask = useTask(function*(signal, { query }) {
  const events = yield searchEvents.perform(query).canceledOn(signal);
  const users = yield searchUsers.perform(query).canceledOn(signal);
  return { events, users };
});
```

Now if that specific task instance of `registerTask` gets cancelled, both the particular instances `validateEmailTask` and `createUserTask` will get cancelled too.

::: tip
`cancelOn()` is generally needed only when you deal with explicit cancelation (calling `cancel()`, `cancelAll()`) or when the task is `restartable()`. In the case of component unmounting, all the task instances are canceled on their own.
:::

## Example

<TimeExample />

```vue
<script lang="ts">
export default defineComponent({
  setup() {
    const time = ref(null);
    const updateTimeTask = useTask(function*() {
      // wait some time to simulate a network request
      while (true) {
        time.value = new Date();
        yield timeout(1000);
      }
    });

    updateTimeTask.perform();

    return {
      time,
      updateTimeTask,
    };
  },
});
</script>

<template>
  <div>
    <hr />
    <div>The time is {{ time }}</div>
    <hr />
    <button :disabled="updateTimeTask.isIdle" @click="updateTimeTask.cancelAll">
      Pause
    </button>
    <button
      :disabled="updateTimeTask.isRunning"
      @click="updateTimeTask.perform"
    >
      Resume
    </button>
  </div>
</template>
```
