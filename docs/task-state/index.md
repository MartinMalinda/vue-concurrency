---
sidebarDepth: 0
---

# Task State

Tasks hold state about the asynchronous operations they encapsulate. Tasks derive state from the adherent task instances and task instances derive state from the progress of the encapsulated generator function.

`Task` can be `idle` or it can be `running`. It is never finished, because a new task instance can always be performed. You can access specific task instances. Most of the time you'll be accessing `last`. But if the task instances are expected to error out and you want to resiliently display some value, you might be using `lastSuccessful`.

`TaskInstance` on the other hand has a clear lifecycle:

1. `hasStarted | isDropped | isEnqueued`
2. `isRunning`
3. `isError | isCanceled | isSuccessful`

Task Instances also hold...

`error` = what has been thrown during the function call  
`value` = what has been returned in the function call

Most of these are frequently used both in templates and elsewhere.

::: tip
There's also more state connected to concurrency policies like `isEnqueued` or `isDropped`.  
See [Managing Concurrency](/managing-concurrency/) for more details.
:::

## Demo

Let's test a task like this one:

```ts
const getUserTask = useTask(function*() {
  // wait some time to simulate an async operation
  yield timeout(2000);

  if (Math.random() < 0.5) {
    // lets say the API is flaky and errors out often:
    throw new Error(`Internal Server Error`);
  }

  return { name: "John", lastName: "Doe" };
});
```

<TaskExample />

::: warning
Tasks and Task instances from vue-concurrency hold state but that does not mean it's a full-fledged state-management solution. Tasks hold state about asynchronous operations. They're not meant to be used as a data store or hold other application state (UI, Authentication...). Tasks are bound to the component they exist on, so the state is short-lived.

Unless your data flow is very straightforward, you might need a more generic state management library on the side, such as VueX, Pinia, XState or others.
:::
