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

<ApiHeader>

### perform()

`(...params: U) => TaskInstance<T>`

 </ApiHeader>

Performs the task and returns a new task instance.

```ts
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
