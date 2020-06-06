---
sidebarDepth: 0
---

# Composing Tasks

If multiple tasks need to be performed there are several ways how to approach it. Although tasks are not Promises, they can be used in a [PromiseLike](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_es5_d_.promiselike.html) way. That means you can use `then()`, `catch()` and `finally()` methods on them and you can also `yield` and `await` them.

You can also pass Tasks to methods like `Promise.all` or `Promise.race`.

## Async / Await example

```ts
setup() {
  const createDatabaseTask = useTask(function*() { /* ... */ });
  const seedDatabaseTask = useTask(function*(signal, db) { /* ... */ });

  async function createAndSeed() {
    try {
      const db = await createDatabaseTask.perform();
      // the result of await is the value of the task instance
      await seedDatabaseTask(db);
    } catch (e) {
      // ... figure out how to handle this task instance error
    }
  }

  return { createDatabaseTask, seedDatabaseTask, createAndSeed  };
}
```

Notice the `try & catch`. When task instances are handled in promisy way, you're responsible for handling potential errors. What if the database creation fails? `seedDatabaseTask` would receive nothing or faulty result.

This approach is fine to do in some cases. But besides the error handling of this we would also need to check progress like `createDatabaseTask.isRunning || seedDatabaseTask.isRunning` in the template. Not ideal.

A better approach is to create a wrap task:

## Wrap task

```ts
setup() {
  const createDatabaseTask = useTask(function*() { /* ... */ });
  const seedDatabaseTask = useTask(function*(signal, db) { /* ... */ });
  const createAndSeedTask = useTask(function*() {
    const db = yield createDatabaseTask.perform();
    yield seedDatabaseTask(db);
  });

  return { createDatabaseTask, seedDatabaseTask, createAndSeedTask  };
}
```

Using a wrap task in this case solves error handling efficiently (error is saved both under child task and `createAndSeedTask.error`) and the `createAndSeedTask` has other helpful state that can be used in the template.

This pattern is so useful that `vue-concurrency` comes with several helpers to make this job easier. They also handle cancelation for you.

### Pipe Task

```ts
const pipeTask = usePipeTask(taskA, taskB, taskC);
pipeTask.perform("foo");
```

Pipe task will perform the child tasks in the provided order and it will pass result value from one to another. If performed with arguments, they are passed to the first task.

### Parallel Task

```ts
const parallelTask = useParallelTask(taskA, taskB, taskC);
parallelTask.perform("bar");
```

This task runs all child tasks in parallel. If performed with arguments, it passes them to all of the child tasks.

### Sequential Task

```ts
const sequentialTask = useSequentialTask(taskA, taskB, taskC);
```

This one is similar to pipe task, except it does not pass the value from one task to another.

## Task creators

You might find yourself creating similar looking tasks at different places. At that point it could be useful to create a function that wraps the creation of the task. It can even take arguments.

```ts
// utils/tasks.js

export function useGetBooksTask ({ includeAuthors: false } = {}) {
  return useTask(function*(signal) {
    let authors;
    if (includeAuthors) {
      // not yield here, to be able to load both requests in parallel
      authors = fetch('/api/authors', { signal });
    }
    const books = fetch('/api/books', { signal });
    return Promise.all([authors, books]);
  });
}
```

```ts
// SomeComponent.vue

import { useGetBooksTask } from '../utils/tasks'

setup() {
  const getBooksTask = useGetBooksTask({ includeAuthors: true }).drop();
  getBooksTask.perform()
}
```

## TaskGroup

TaskGroups are another construct that help dealing with multiple tasks. But as opposed to wrap tasks they are not meant for performing, only for tracking state.

```ts
const taskGroup = useTaskGroup({ taskA, taskB, taskC });
console.log(taskGroup.isRunning); // false
console.log(taskGroup.isIdle); // true
console.log(taskGroup.taskA); // taskA
```

`useTaskGroup()` does not return a task but only an object with state and each of the tasks.

The usecase is then quite different from Wrap Tasks - you want to track state of multiple tasks but you don't want to perform all of them.

**Usecase**: you have a search input and you can search in multiple categories and each category is represented by a different task because it reaches a different endpoint. The spinner should show if any of the tasks are running.
