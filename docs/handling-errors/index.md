---
sidebarDepth: 0
---

# Handling Errors

Tasks are designed to make error handling easier. By default tasks catch any errors that are thrown when the task is running:

```ts
const task = useTask(function*() {
  throw new Error("You shall not pass");
});

const instance = task.perform();
console.log(instance.isError); // true
console.log(instance.error); // Error 'You shall not pass'
```

This means that errors thrown inside tasks are "safe" and they will not crash your app. The error is "handled" by being put in the `error` which is then used, most commonly in the template:

```vue
<template>
  <div v-if="task.isRunning">
    Loading ...
  </div>
  <div v-else-if="task.last.isError" class="alert">
    {{ task.last.error.message }}
  </div>
  <div v-else>
    {{ task.last.vaue }}
  </div>
</template>
```

## AJAX error responses

When doing XHR/Fetch inside tasks it is important to make sure that an error is thrown when the response is not OK. That generally means throwing an error when the status code is in the range of 4XX, 5XX. [Axios](https://github.com/axios/axios) is doing that by default. [Fetch does not do that](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful), it only sets `response.ok` to false.

The issue is described in this article:  
[Fetch and errors](https://www.tjvantoll.com/2015/09/13/fetch-and-errors/)

To make sure an error is thrown, you can create a small wrapper function like this:

```ts
function ajax(url, options) {
  return fetch(url, options).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw {
          ...data,
          status: response.status,
          statusText: response.statusText,
        };
      }
      return data;
    })
  );
}
```

## Promises and async/await

A different situation is, when you handle a task via async/await or promise-y way. In that case you're expected to catch errors yourself. That means `.catch()` if using task like Promise or `try catch` if you're using `async await`. This allows proper propagation of errors when tasks are being used in other tasks (see [Composing Tasks](/composing-tasks/)).

### async/await

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

### Promise syntax

```ts
setup() {
  const createDatabaseTask = useTask(function*() { /* ... */ });
  const seedDatabaseTask = useTask(function*(signal, db) { /* ... */ });

  async function createAndSeed() {
    createDatabaseTask.perform().then(db => {
      return seedDatabaseTask.perform(db);
    }).catch(error => {
      // handle error
    });
  }

  return { createDatabaseTask, seedDatabaseTask, createAndSeed  };
}
```
