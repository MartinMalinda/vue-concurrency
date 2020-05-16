# Tasks and Task Instances

When `useApi()` is called, the returned object is a `Task`. You can think of it as a wrapper over the generator function. Just like an async function can be called many times with different arguments and different results, so can `Task`. `Tasks` are performed and the result of that is `TaskInstance`. One `Task` can therefore have many TaskInstances. But as opposed to plain functions, Task is a reactive object and it is aware of all its TaskInstances.

Among other things, Task is running if at least on the TaskInstances is running. You can access `last` and `lastSuccessful` task instance.

## Passing tasks

This encapsulation brings benefits especially if your components are aware of it. Instead of passing a callback or emitting events, you can pass a task to a component:

```vue
<RegisterForm :saveTask="saveUserTask" />
```

When the form is submitted, the component just calls `saveTask.perform(userData)`.
There's benefits to this approach:

- There's no need to pass several props like `isLoading`, `serverError` and `onSuccess`
- `Task` API is always the same, so it ensures code and UX consistency across different forms
- The `saveUserTask` can potentially be also passed elsewhere
- `saveTask` can be easily mocked in component tests. There's no need to do network stubbing. You can test just client side validation in `RegisterForm` component test and the whole flow in an E2E test or `<RegisterPage>` component test.

Let's take a look at a different scenario:

There's a `<Home>` component with a template like this:

```vue
<div>
  <Row v-if="!isFeedLoading">
    <Feed :data="feedData">
    <SuggestedProfiles />
  </Row>
  <div v-else>
    Loading...
  </div>
</div>
```

Let's assume `<SuggestedProfiles />` does an AJAX request on it's own. The problem is the AJAX happens only after the feed has finished loading. Yet, the loading could easily happen in parallel.  
One way to solve this is to refactor with tasks:

```vue
<div>
  <Row>
    <Feed :fetchTask="getFeedTask" />
    <SuggestedProfiles :fetchTask="getProfilesTask" />
  </Row>
</div>
```

In this case - `<Home>` is in control of data fetching. It can perform both tasks in parallel, or one after another. But the data fetching strategy can be changed without passing specific props and changing logic in different components. Both `<Feed>` and `<SuggestedProfiles>` are simple presentational components for which it's easy to write tests.

## Generic task-aware components

If we're operating with tasks, we can create generic components that can operate with them smartly.

### `<AsyncContent />`

```vue
<AsyncContent :task="task">
  <div v-if="task.last.value">
    {{ task.last.value }}
  </div>
</AsyncContent>
```

Such a component can...

- Display a spinner if `task.isRunning`
- Display an error from `task.last.error` with an option to retry (`task.perform()`)
- Resiliently try to perform the task again in case of an network error
- Display the default slot if the data are ready
- Enforce consistent loading and error views

The error and loading views can be overriden with scoped slots:

```vue
<AsyncContent :task="task">
  <template name="loading">Some-content-placeholder</template>
  <template>{{ task.last.value }}</template>
</AsyncContent>
```

### `<TaskButton />`

```vue
<TaskButton :task="deleteTask">Delete</Task>
```

<TaskProvider :time="1000" v-slot="{ task }"><button @click="task.perform" :disabled="task.isRunning">{{ task.isRunning ? "Delete..." : "Delete" }}</button></TaskProvider>

Perform the task on click, show a spinner inside if the task is running. In case of an error, show it in a dropdown.

### Others

The list goes on, there can be `<TaskForm>`, `<TaskModal>` and so on. You can make your components very task aware or not at all. There's pros and cons of course. Tasks enforce consistency, but having these specific components locks you in to use them (which might be a good thing though:)).
