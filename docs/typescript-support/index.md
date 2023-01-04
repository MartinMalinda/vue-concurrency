---
sidebarDepth: 0
---

# Using with TypeScript

`vue-concurrency` is written in TypeScript and therefore has a 1st class TypeScript support. In most cases the types should be correctly inferred.

```ts
// Task<User, [string, number]>
const addUser = useTask(function*(signal, name: string, age: number) {
  return new User({ name, age });
});
```

If it's helpful, you can specify a task type explicitly:

```ts
// the implementation of this task has to return User and take a string and number arguments
const addUser = useTask<User, [string, number]>(function*(signal, name, age) {
  return new User({ name, age });
});
```

## Known limitations

Unfortunately, with current limitations of TypeScript it's not possible to correctly infer results of `yield` operations. That will leave any `yield`ed value with type `any`. If possible, it's good to avoid `return yield` and do just `return`. But any intermediate values that were `yield`ed have to be typed explicily:

```ts
useTask(function*(signal) {
  const accounts: Account[] = yield someAjax('/accounts', { signal });
});
```

If you're using custom async functions it is possible to make this pattern a bit more generic. This pattern has been borrowed from [redux-saga-typescript](https://github.com/ilbrando/redux-saga-typescript).

```ts
import { YieldReturn } from 'vue-concurrency/src/Task';

/* ... */

useTask(function*(signal) {
  const accounts: YieldReturn<typeof getAccounts> = yield getAccounts({ signal });
});
```

This will make `accounts` the same type as what the Promise from `getAccounts` resolves to. The same approach can be used for performing tasks:

```ts
useTask(function*() {
  const accounts: YieldReturn<typeof getAccountsTask> = yield getAccountsTask.perform();
});
```

As an alternative, there's also [useAsyncTask()](/api-overview/other/#useasynctask) for which there's no issue of typing awaited values:

```ts
useAsyncTask(function*() {
  const accounts = await getAccountsTask.perform(); // correct typing here
});
```

It can be used if cancelation is not a priority.

---

::: tip

- [Github issue: Task return type is not inferred with `return yield`](https://github.com/MartinMalinda/vue-concurrency/issues/2)
  :::
