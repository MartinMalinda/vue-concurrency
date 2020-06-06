---
sidebarDepth: 0
---

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

### perform() `(...params: U) => TaskInstance<T>`

Performs the task and returns a new task instance.

```ts
const task = useTask(function*(signal, a, b) {
  /* ... */
});
const taskInstance = task.perform(1, 2);
```

### cancelAll() `() => void`

Cancels all running or enqueued instances.

```ts
task.cancelAll();
```

### performCount `number`

Return the number of times the task was performed.

### isRunning `boolean`

Returns `true` if there's at least one running instance.

```vue
<template>
  <div v-if="task.isRunning">Loading...</div>
</template>
```

### isIdle `boolean`

Task is idle if there's no running instance.

### isError `boolean`

Task isError if the last instance has error.

### last `TaskInstance<T> | undefined`

Returns the last task instance if there's any.

### lastSuccessful `TaskInstance<T> | undefined`

Returns the last task successful instance if there's any.

### drop() `Task<T, U>`

Set's the concurrency policy to [drop](/managing-concurrency/#drop) and returns itself.

### enqueue() `Task<T, U>`

Set's the concurrency policy to [enqueue](/managing-concurrency/#enqueue) and returns itself.

### restartable() `Task<T, U>`

Set's the concurrency policy to [restartable](/managing-concurrency/#restartable) and returns itself.

### keepLatest() `Task<T, U>`

Set's the concurrency policy to [keepLatest](/managing-concurrency/#keepLatest) and returns itself.

### maxConcurrency() `Task<T, U>`

Set's the [max concurrency](/managing-concurrency/#maxconcurrency) and returns itself.
