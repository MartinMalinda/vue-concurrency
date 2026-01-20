---
sidebarDepth: 0
---

<script setup>
import ApiHeader from '../../.vitepress/components/ApiHeader.vue';
</script>

## Task

`useTask()` Accepts a Generator functions and returns a `Task<T, U[]>` where `T` is the return value of the generator and `U` is the type of parameters.

```ts
import { useTask } from "vue-concurrency";

/* ... */

const getProgressTask = useTask(function*() {
  const number = yield ajax("/api/progress");
  return number * 100;
});
```

<ApiHeader>

### perform()

`(...params: U) => TaskInstance<T>`

</ApiHeader>

Performs the task and returns a new task instance.

```ts
import { useTask } from "vue-concurrency";

const task = useTask(function*(signal, a, b) {
  /* ... */
});
const taskInstance = task.perform(1, 2);
```

<ApiHeader>

### cancelAll()

`() => void`

</ApiHeader>

Cancels all running or enqueued instances.

```ts
task.cancelAll();
```

<ApiHeader>

### clear()

`() => void`

</ApiHeader>

Cancels all running or enqueued instances and clears the instance stack to reset the task to initial state.

```ts
task.cancelAll();
```



<ApiHeader>

### performCount `number`

</ApiHeader>

Return the number of times the task was performed.

<ApiHeader>

### isRunning

`boolean`

</ApiHeader>

Returns `true` if there's at least one running instance.

```vue
<template>
  <div v-if="task.isRunning">Loading...</div>
</template>
```

<ApiHeader>

### isIdle

`boolean`

</ApiHeader>

Task is idle if there's no running instance.

<ApiHeader>

### isError

`boolean`

</ApiHeader>

Task isError if the last instance has error.

<ApiHeader>

### last

`TaskInstance<T> | undefined`

</ApiHeader>

Returns the last task instance if there's any.

<ApiHeader>

### lastSuccessful

`TaskInstance<T> | undefined`

</ApiHeader>

Returns the last task successful instance if there's any.

<ApiHeader>

### drop()

`Task<T, U>`

 </ApiHeader>

Set's the concurrency policy to [drop](/managing-concurrency/#drop) and returns itself.

<ApiHeader>

### enqueue()

`Task<T, U>`

 </ApiHeader>

Set's the concurrency policy to [enqueue](/managing-concurrency/#enqueue) and returns itself.

<ApiHeader>

### restartable()

`Task<T, U>`

 </ApiHeader>

Set's the concurrency policy to [restartable](/managing-concurrency/#restartable) and returns itself.

<ApiHeader>

### keepLatest()

`Task<T, U>`

 </ApiHeader>

Set's the concurrency policy to [keepLatest](/managing-concurrency/#keepLatest) and returns itself.

<ApiHeader>

### maxConcurrency()

`Task<T, U>`

 </ApiHeader>

Set's the [max concurrency](/managing-concurrency/#maxconcurrency) and returns itself.

## Task Options

You can configure default task behavior by passing options to `useTask()`:

```ts
import { useTask } from "vue-concurrency";

const task = useTask(function*() {
  // ...
}, {
  cancelOnUnmount: true,  // default: true
  pruneHistory: true,     // default: true
  keepSuccessful: 2,      // default: 2
  maxInstances: 50,       // default: 50
  pruneDelayMs: 1000,     // default: 1000
});
```

### App-wide task defaults (SSR-safe)

If you use Nuxt/SSR or have multiple Vue apps, prefer app-scoped defaults via the config plugin:

```ts
import { VueConcurrencyConfig } from "vue-concurrency/config";

app.use(VueConcurrencyConfig, {
  taskDefaults: {
    maxInstances: 20,
    pruneDelayMs: 250,
  },
});
```

Per-task options override app defaults:

```ts
useTask(cb, { maxInstances: 5 }); // overrides to 5
```

## Nuxt example

`plugins/vue-concurrency.ts`:

```ts
import { defineNuxtPlugin } from "#app";
import { VueConcurrencyConfig } from "vue-concurrency/config";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueConcurrencyConfig, {
    taskDefaults: {
      pruneHistory: true,
      keepSuccessful: 2,
      maxInstances: 20,
      pruneDelayMs: 250,
    },
  });
});
```

