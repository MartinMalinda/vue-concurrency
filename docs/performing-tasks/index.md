---
sidebarDepth: 0
---

# Performing Tasks

Performing a task and creating a new task instance happens via calling `perform()`.

```ts
setup() {
  const getUsersTask = useTask(function*() {
    const response = yield get("/api/users");
    return response.data;
  });
  const getUsers = getUsersTask.perform(); // TaskInstance
  // You can pass the task instance or you can pass the task and use `last` to access the instance.
  return { getUsersTask };
}
```

If you just need to use a task once and only use the instance, you can perform right away:

```ts
setup() {
  const getUsers = useTask(function*() { /* ... */ }).perform();
  return { getUsers };
}
```

This shortcut is useful when fetching data or perfoming immediately for other reasons but it has a downside of losing a referrence to the task. There's only a referrence to the task instance. You can't perform the task again, so you can't allow the user to retry.

## Passing arguments

Just like you can pass different arguments when calling the same function, you can pass different arguments when performing tasks.

```vue
<script lang="ts">
export default defineComponent({
  setup() {
    const formState = reactive({
      email: "",
      password: "",
    });

    const saveUserTask = useTask(function*(signal, userData, redirect) {
      // Access userData and redirect from arguments
      const response = yield post("/api/users", userData);
      if (redirect) {
        router.push({ path: "/" });
      }
    });

    return { formState, saveUserTask };
  },
});
</script>

<template>
  <!-- Pass arguments when performing -->
  <form @submit.prevent="() => saveUserTask.perform(formState, true)">
    <label for="email">Email:</label>
    <input id="email" v-model="formState.email" type="email" />
    <label for="password">Password:</label>
    <input id="password" v-model="formState.password" type="password" />
    <input :disabled="saveUserTask.isRunning" type="submit" value="Register" />
  </form>
</template>
```

You might have noticed the `signal` as the first argument in the task function.  
It's an instance of [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) and it's used for fetch/xhr [cancellation](/cancellation/). It's always passed when the task is performed and the other arguments are added next to it.
