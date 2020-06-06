---
sidebarDepth: 0
---

## TaskInstance

New task instance is created via [performing a task](/api-overview/use-task/#perform).

```ts
const task = useTask(function*(signal, a, b) {
  /* ... */
});
const taskInstance = task.perform(1, 2);
```

### value `T | null`

The value of an instance is what the perform function returns.

```ts
const taskInstance = task.perform();
await taskInstance;
console.log(taskInstance.value);
```

### error `any | null`

Instance saves in `error` whatever was thrown during the perform call. Read more about [handling errors](/handling-errors/).

```ts
const task = useTask(function*() {
  throw new Error("You shall not pass");
});

const instance = task.perform();
console.log(instance.error);
```

### hasStarted `boolean`

Instance is started immediately after a task is performed unless it was enqueued or dropped or immediately canceled.

### isRunning `boolean`

Instance is running unless it's finished, dropped or enqueued.

### isFinished `boolean`

Instance is finished if it has resolved a value or threw an error

### isError `boolean`

```ts
if (instance.isError) {
  console.log(instance.error);
}
```

### isSuccessful `boolean`

Instance is successful if it is finished and there's no error

### isCanceled `boolean`

Instance is canceled if it was cancelled implicitly (via cancel on unmount) or explicitly via `cancel()` or [cancelAll()](/api-overview/use-task/#cancelall-void).

### isDropped `boolean`

Instance may be dropped if the task has [drop()](/managing-concurrency/#drop) or [keepLatest()](/managing-concurrency/#keeplatest) concurrency policy.

### isEnqueued `boolean`

Instance may be enqueued if the task has [enqueue()](/managing-concurrency/#enqueue) or [keepLatest()](/managing-concurrency/#keeplatest) concurrency policy.

### then() `(onfulfilled: onFulfilled<T>, onrejected?: onRejected) => Promise<any>`

Allows to use the task in a PromiseLike way. Returns a promise which allows chaining just like with regular promises. This also allows the instance to be awaited.

```ts
const instance = task.perform();
instance.then((resultValue) => {
  // ...
});

// or just await

const value = await instance;
```

Read more about [composing tasks](/composing-tasks/).

### catch() `(onrejected?: onRejected) => any`

Allows to catch errors that were thrown during the perform call.

```ts
const instance = task.perform();
instance.catch((error) => {
  console.error(error);
});

// or just await with try catch

try {
  const value = await instance;
} catch (error) {
  console.error(error);
}
```

### finally() `() => any`

`finally` is called either way not matter if instance resolved or rejected

### status `"running" | "enqueued" | "canceled" | "canceling" | "dropped" | "error" | "success"`

`status` might be useful for debugging purposes.

```vue
<template>
  <div>{{ myTask.status }}</div>
</template>
```

### canceledOn() `(signal: AbortSignalWithPromise) => TaskInstance<T>`

This is used for some cases when cancelation does not cascade. [See details here](/cancellation/#cancelation-cascade).

### id `number`

`id` might be useful sometimes for debugging purposes as it's simply the index of the task instance within the task.
