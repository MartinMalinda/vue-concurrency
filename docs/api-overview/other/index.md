---
sidebarDepth: 0
---

## Utils

### waitForValue() `(cb: () => T): Promise<T>`

This helper allows waiting until some reactive value is truthy. This may be useful in some cases when the task is supposed to wait for some DOM API or some other event. It should be used when there's no easy alternative.

```ts
import { waitForValue } from "vue-concurrency";

const someElementWidth = ref(null);
const task = useTask(function*() {
  const width = yield waitForValue(() => someElementWidth.value);
  // do something with the width
});
```

### printTask() `Task<any, any[]> => void`

Logs useful information about the task into the console. This might be useful for debugging.

```ts
import { printTask } from "vue-concurrency";

// on any change to the task, print it to the console!
watchEffect(() => {
  printTask(task);
});
```

### getCancelToken() `(axios : object, signal: AbortSignalWithPromise) => object`

Because `Axios` is frequently used with Vue apps, `vue-concurrency` provides a helper function that allows creating an axios cancel token from the `AbortSignal`.

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

### useAsyncTask() `(cb: (signal: AbortSignalWithPromise, ...params: U) => Promise<T>) => Task<T, U>`

This hook is a wrapper over `useTask()` that allows to pass an async function instead. It returns a Task just like a regular useTask hook but due to limitation of promises, the cancelation is not as good (the async function keeps running even if the task is canceled). The main advantage is that `await` has working type inferrence in TypeScript.

```ts
const saveTask = useAsyncTask(async (signal, data) => {
  const response = await ajax("/some/method", { data });
  return response.data;
});

saveTask.perform({ name: "Joe" });
```

### usePipeTask() `(...tasks: Task<any, any[]>[]) => Task<any, any[]>`

```ts
import { usePipeTask } from "vue-concurrency";
```

- [Details](/composing-tasks/#pipe-task)

### useParallelTask() `(...tasks: Task<any, any[]>[]) => Task<any, any[]>`

```ts
import { useParallelTask } from "vue-concurrency";
```

- [Details](/composing-tasks/#parallel-task)

### useSequentialTask() `(...tasks: Task<any, any[]>[]) => Task<any, any[]>`

```ts
import { useSequentialTask } from "vue-concurrency";
```

- [Details](/composing-tasks/#sequential-task)

### useTaskGroup() `(tasks: Record<string, Task<any, any[]>>)`

```ts
import { useTaskGroup } from "vue-concurrency";
```

- [Details](/composing-tasks/#task-group)
