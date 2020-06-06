---
sidebarDepth: 0
---

# Loading states

There's several approaches how to approach loading states.

You can access `task.isRunning` or `task.last.isRunning`. But the first one is usually better because the latter one can error out if the task was not performed yet (there's no `last`).

Simplest example:

```vue
<script>
export default defineComponent({
  setup() {
    const task = useTask(function*() {
      yield timeout(1000);
      return "tada";
    });

    task.perform();
    return { task };
  },
});
</script>
<template>
  <div>
    <div v-if="task.isRunning">
      Loading...
    </div>
    <div v-else-if="task.isError">
      Something went wrong
    </div>
    <div v-else>
      {{ task.last.value }}
    </div>
  </div>
</template>
```

<TaskProvider :time="1000" v-slot="{ task }">
  <div>
    <div v-if="task.isRunning">
      Loading...
    </div>
    <div v-else-if="task.isError">
      Something went wrong
    </div>
    <div v-else>
      tada <br />
    </div>
    <button @click="task.perform"> Start </button>
  </div>
</TaskProvider>

## AsyncContent

Because a pattern like that is very common it might be worth expanding energy into improving it. There can be a component that accepts a task and displays the right result based on the derived state.

With the power of named and scoped slots, it is possible to design this so that this component is customizable in every way but provides a reasonable default.

```vue
<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  props: {
    task: {
      required: true,
      type: Object,
    },
  },

  setup(props) {
    const lastValue = computed(() => props.task.last && props.task.last.value);
    const lastError = computed(() => props.task.last && props.task.last.error);

    return { lastValue, lastError };
  },
});
</script>

<template>
  <div>
    <slot name="loading" v-if="task.isRunning">
      Loading... (put your favourite spinner here)
    </slot>
    <slot name="error" v-else-if="task.isError" :error="lastError">
      <div>
        <p>{{ lastError.message || "Something went wrong" }}</p>
        <button @click="task.perform">Try again</button>
      </div>
    </slot>
    <slot v-else-if="task.performCount > 0" :lastValue="lastValue" />
  </div>
</template>
```

### Usage

When a component is designed like this, the most straightforward usage is like this:

```vue
<template>
  <AsyncContent :task="myTask" v-slot="{ lastValue }">
    <div v-if="lastValue">
      {{ lastValue }}
    </div>
  </AsyncContent>
</template>
```

In this case the `v-if` is not necessary but it's a good practice because **slots are processed eagerly**. So accessing some value on `task.last` if task is not finished would lead to errors.

Providing custom loading or error template can be done this way:

```vue
<template>
  <AsyncContent :task="getUsersTask">
    <template v-slot:loading>
      Users are loading!
    </template>
    <template v-slot:error="{ error }">
      Could not load users. {{ error.message }}
    </template>
    <template v-slot="{ lastValue }">
      {{ lastValue }}
    </template>
  </AsyncContent>
</template>
```

Like this, the component provide consistent default behavior but is flexible to be used differently when it's needed.

## Demo

<br />

<TaskProvider :time="1000" :errorChance="0.7" v-slot="{ task }">
  <AsyncContent :task="task" v-slot="{ lastValue }">
    {{ lastValue }}
  </AsyncContent>
  <br />
  <button @click="task.perform">Perform</button>
</TaskProvider>

<br />
<hr />
<br />

::: tip
Accessing properties on a `last` instance that does not exist can lead to errors. Check for truthy `task.last` can be annoying at times.

If you're using TypeSript it becomes easier with [optional chainging](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) via `task.last?.value`, but [unfortunately it does not work in templates](https://github.com/vuejs/vue/issues/11088).

There's other approaches like `get(() => some.very.deep.value)` or  
`_.get(obj, 'deep.value')` from [lodash](https://lodash.com/docs/#get).
:::
