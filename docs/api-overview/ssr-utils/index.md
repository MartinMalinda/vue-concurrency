---
sidebarDepth: 0
---

## SSR utils

<ApiHeader>

### useTaskPrefetch

`(key: string, task: Task<T, any>) => TaskInstance<T>`

</ApiHeader>

`useTaskPrefetch` has the same philosophy as `Fetch` in Nuxt. If called on the server, it performs the task and saves the result to the cache. Actually it saves the whole task with all the instances. On the client, the task instances are recovered. `task.last` therefore is the instance that was performed on the server. If there's no `task.last` the task is performed on the client. That covers cases of client side transitions.

See [SSR support](/ssr-support/#with-vue-concurrency-ssr-utils) for details.

<ApiHeader>

### useSSRPersistance

`(key: string, task: Task<any, any>) => void`

</ApiHeader>

This hook makes sure the task is serialized on the server and recovered on the client but it doesn't do any performing for you.

See [SSR support](/ssr-support/#with-vue-concurrency-ssr-utils) for details.
