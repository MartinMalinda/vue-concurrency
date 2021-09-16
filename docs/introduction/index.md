---
sidebarDepth: 0
---

# Introduction

`vue-concurrency` is a port of <a href="http://ember-concurrency.com/docs/introduction" target="_blank">ember-concurrency</a> and as such aims to solve the same area of problems. It's a library that has been widely popular in the ember community for years and that was proven to be easy to use in many applications in production. Vue's latest advances with Composition API allowed development of this port, keeping almost the same public API.

Feel free to head over to the docs of <a href="http://ember-concurrency.com/docs/introduction" target="_blank">ember-concurrency</a> and read the theoretical introduction there or stay here for a shorter and briefer version.

## The problem: defensive programming, race conditions

Client side applications often have to deal with managing asynchronous operations. These can be asynchronous requests to the server, logic happening in the background and also reacting to user input in various forms - scrolling, navigating, interacting with form UI and so on. We also want to create more resilient UIs which means we want to retry AJAX calls repeatedly in case of a network fail, or we want to give the user an option to retry manually.

We often have to use techniques like debouncing, throttling. On the side, we may resolve to a lot of defensive programming to do this safely and we set variable flags like `isSearching`, `isLoading`, `isError` by ourselves. Not only is this tedious to do over and over again, it also leaves space for bugs. Forgetting to set `isLoading` to `false` in some edgecase will leave the UI in a loading state forever. Forgetting to turn off some background operation when user transitions to a different page can lead to errors. It's better if this doesn't have to be done.

## More safety and less boilerplate with Tasks

`vue-concurrency` introduce the concept of `Task` which encapsulates an asynchronous operation.
You might think of a `Task` as a `Promise` and there indeed is an overlap, but `Task` provides much more features, while still staying relatively lightweight and simple.

`Task` has two fundamental qualities:

- It has it's own derived state. `isIdle`, `isRunning`, `isError` and so on. There's no need to manage that yourself anymore.
- It can be canceled. And it is cancelled automatically if the component where it is used has been unmounted.

On top of that, it is possible to set a concurrency policy in a declarative way.  
Handling form submission? Set the `Task` to `drop()` to prevent duplicate submissions.  
Perfoming a search when user types into an input? Add a delay and set a task to be `restartable()`.  
Need to poll the server in a regular interval? A `while (true) {}` loop is fine to do with Tasks because they can be canceled.

### Basic Example

```vue
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { useTask } from "vue-concurrency";

export default defineComponent({
  setup() {
    // Declaring a Task:
    const getUsersTask = useTask(function*() {
      /* Tasks use generators instead of async functions.
      They can function effectively the same way as async functions,
      writing yield instead of await,
      but as opposed to Promises, they can be cancelled. */

      // Using any promise-friendly ajax solution: axios, fetch...
      // It should throw in case of an error response
      const response = yield get("/api/users");

      // What gets returned will end up on the task instance in `.value`
      return serializeUsers(userData);
    });

    // This is a task for fetching data from the server, lets perform it right away
    getUsersTask.perform();
    // In case of saving a user, the `perform()` would happen later (after form submission)

    // Pass the whole Task to the template
    return { getUsersTask };
  },
});
</script>

<template>
  <div>
    <div v-if="getUsersTask.isRunning">Loading...</div>
    <div v-else-if="getUsersTask.isError">
      <p>{{ getUsersTask.last.error.message }}</p>
      <button @click="getUsersTask.perform">Try again</button>
    </div>
    <!-- via `.last`, the last TaskInstance is accessed. -->
    <div v-else v-for="user in getUsersTask.last.value">
      {{ user.name }}
    </div>
  </div>
</template>
```

So this is a quick peek on what `vue-concurrency` can do. For this usecase it would also be easy to use other solutions, such as a simple `usePromise` hook, new `Suspense API` or `<Await>` component. The benefit of a `Task` is that the usage can be later on extended for more advanced cases (chaining, handling concurrency). Tasks are also not strictly tied to the template so you can reuse the same concepts elsewhere than view logic. More on that later.
