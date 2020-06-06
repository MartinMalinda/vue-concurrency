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

<ApiHeader>

### value

`T | null`

</ApiHeader>

The value of an instance is what the perform function returns.

```ts
const taskInstance = task.perform();
await taskInstance;
console.log(taskInstance.value);
```

<ApiHeader>

### error

`any | null`

</ApiHeader>

Instance saves in `error` whatever was thrown during the perform call. Read more about [handling errors](/handling-errors/).

```ts
const task = useTask(function*() {
  throw new Error("You shall not pass");
});

const instance = task.perform();
console.log(instance.error);
```

<ApiHeader>

### hasStarted

`boolean`

</ApiHeader>

Instance is started immediately after a task is performed unless it was enqueued or dropped or immediately canceled.

<ApiHeader>

### isRunning

`boolean`

</ApiHeader>

Instance is running unless it's finished, dropped or enqueued.

<ApiHeader>

### isFinished

`boolean`

</ApiHeader>

Instance is finished if it has resolved a value or threw an error

<ApiHeader>

### isError

`boolean`

</ApiHeader>

```ts
if (instance.isError) {
  console.log(instance.error);
}
```

<ApiHeader>

### isSuccessful

`boolean`

</ApiHeader>

Instance is successful if it is finished and there's no error

<ApiHeader>

### isCanceled

`boolean`

</ApiHeader>

Instance is canceled if it was cancelled implicitly (via cancel on unmount) or explicitly via `cancel()` or [cancelAll()](/api-overview/use-task/#cancelall-void).

<ApiHeader>

### isDropped

`boolean`

</ApiHeader>

Instance may be dropped if the task has [drop()](/managing-concurrency/#drop) or [keepLatest()](/managing-concurrency/#keeplatest) concurrency policy.

<ApiHeader>

### isEnqueued

`boolean`

</ApiHeader>

Instance may be enqueued if the task has [enqueue()](/managing-concurrency/#enqueue) or [keepLatest()](/managing-concurrency/#keeplatest) concurrency policy.

<ApiHeader>

### then()

`(onfulfilled: onFulfilled<T>, onrejected?: onRejected) => Promise<any>`

</ApiHeader>

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

<ApiHeader>

### catch()

`(onrejected?: onRejected) => any`

</ApiHeader>

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

<ApiHeader>

### finally()

`() => any`

</ApiHeader>

`finally` is called either way not matter if instance resolved or rejected.

<ApiHeader>

### status

`"running" | "enqueued" | "canceled" | "canceling" | "dropped" | "error" | "success"`

</ApiHeader>

`status` might be useful for debugging purposes.

```vue
<template>
  <div>{{ myTask.status }}</div>
</template>
```

<ApiHeader>

### canceledOn()

`(signal: AbortSignalWithPromise) => TaskInstance<T>`

</ApiHeader>

This is used for some cases when cancelation does not cascade. [See details here](/cancellation/#cancelation-cascade).

<ApiHeader>

### id

`number`

</ApiHeader>

`id` might be useful sometimes for debugging purposes as it's simply the index of the task instance within the task.
