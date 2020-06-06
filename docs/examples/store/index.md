---
sidebarDepth: 0
---

# Saving data to Store

All the task state is short-lived because task lives on a component and it gets destroyed when the component is unmounted. If you need the state to survive this, there's several options. You can move your task to a parent component and pass it down. In many cases this is fine but often the task can become too far away from the place it is actually used and that makes your whole application code harder to reason about, not to mention the necessary prop-drilling.

A common approach for keeping long-lived state is some kind of centralized store. In Vue apps that's usually `VueX`. In the examples below, `Pinia` is used which is more lightweight and is designed for Composition API.

`vue-concurrency` shouldn't pose any blockers for using a centralized store.

The most direct approach is to just call store getters and mutations on the side of using tasks:

```ts
setup() {
  const store = useStore();
  const getUsersTask = useTask(function*(signal) {
    if (store.state.hasUsers) {
      return store.state.users;
    }

    return ajax('/api/users', { signal });
  });

  getUsersTask.perform().then(users => {
    store.addUsers(users);
  });

  return {
    getUsersTask
  }
}
```

This is okay in many cases but there's space for a more opinionated abstraction.

Let's imagine we'd have a specific api task that would be used like this:

```ts
setup() {
  const getUsersTask = useApiTask('Users', { useCache: true });
  getUsersTask.perform();
  return {
    getUsersTask
  }
}
```

Such a `useApiTask` would...

- call a specific Users() function that would make a request to the server
- if successful, it would call a matching mutation or action `setUsers` on store and saved state
- it would call a `getUsers` getter to receive the data back from state
- if there's data in store and `useCache: true` it would return the store data right away

Such a naming convention adds more structure and removes data-wiring code form the components.

### Possible implementation:

```ts
import useStore from "../store";
import { useTask } from "vue-concurrency";

export const endpoints = {
  getUsers(signal) {
    return ajax("/users", { signal });
  },
};

export function useApiTask(endpointName, { useCache: false } = {}) {
  // access the store via `use`. It works by default with Pinia, needs some more setup with VueX.
  const store = useStore();
  // pick the right endpointHandler from the endpoints map
  const endpointHandler = endpoints[apiActionName];

  if (!endpointHandler) {
    throw new Error(`Unknown endpoint ${endpointName}`);
  }

  const actionName = `set${endpointName}`;
  return useTask(function*(signal, ...args) {
    // if useCache is true and there's data in a matching getter, return data from store right away
    if (useCache && store[endpointName] && store[endpointName].value) {
      return store[endpointName];
      // for VueX it could be store.getters[`get${endpointName}`]() but VueX getter memoization could cause issues in this case.
    }

    // call the endpoint handler with all the params from perform();
    const data = yield endpointHandler(signal, ...args);
    // call an action/mutation in store and pass the data
    // store does necessary serialization and stores the state
    if (store[actionName]) {
      store[actionName](data);
      // with VueX, this would be store.commit(mutationName, data);
    }

    // check if there's a getter matching the endpoint name and if yes, use it
    if (store[endpointName] && store[endpointName].value) {
      return store[endpointName];
      // with VueX, this would be store.getters[`get${endpointName}`]();
    }

    // if there's no getter, return the result directly
    return data;
  });
}
```
