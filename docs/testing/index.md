---
sidebarDepth: 0
---

# Testing

Encapsulation and consistence of tasks can make tests more straightforward. Components that accept tasks via props are quite straightforward to test.

There's two common approaches for testing such components.

## A) Passing actual tasks

You might be tempted to create e test like this, but **this approach will not work** ❌:

```ts
describe("SaveButton", () => {
  it("is disabled when the task is running", () => {
    // Error: hook has been called outside of setup
    const task = useTask(function*() {
      return "success";
    });
    const wrapper = mount(SaveButton, {
      propsData: {
        task,
      },
    });

    task.perform();
    expect(wrapper.find("button")).toBeDisabled();
  });
});
```

This will unfortunately error out, because `useTask()` along with many other hooks cannnot be used outside of `setup()`.

It's necessary then to create a wrap component that passes the task to the tested component ✅:

```ts
import Vue, { h } from "vue";

describe("SaveButton", () => {
  it("is disabled when the task is running", async () => {
    let task;
    const wrapper = mount(
      defineComponent({
        setup() {
          task = useTask(function*() {
            return "success";
          });

          // render the tested component
          return () =>
            h(SaveButton, {
              propsData: { task },
            });
        },
      })
    );

    task.perform();
    expect(wrapper.find("button")).toBeDisabled();
    await task.last;
    expect(wrapper.find("button")).not.toBeDisabled();
  });
});
```

You can probably simplify this process with some handy helper function:

```ts
export function setupAndMount(setup) {
  return mount(defineComponent({ setup });
  );
}

// in test:
let task;
const wrapper = setupAndMount(() => {
  task = useTask(function*() {
    return "success";
  });

  // render the tested component
  return () =>
    h(SaveButton, {
      propsData: { task },
    });
});
```

::: tip
There's an open issue to make this easier:

- [Allow useTask to be used outside of setup](https://github.com/MartinMalinda/vue-concurrency/issues/1)
  :::

## B) Using reactive object instead of a task

If the approach described above is too much of a hassle, you can take a simpler approach and just pass a reactive object, because that's in essence what tasks really are:

```ts
describe("SaveButton", () => {
  it("is disabled when the task is running", async () => {
    const task = reactive({
      isRunning: true,
      performCount: 1,
    });
    const wrapper = mount(SaveButton, {
      propsData: {
        task,
      },
    });

    expect(wrapper.find("button")).toBeDisabled();
    // change the reactive object in between test
    task.isRunning = false;
    await Vue.nextTick();
    expect(wrapper.find("button")).not.toBeDisabled();
  });
});
```

This is easier to setup and you can create exact task state that fits your test. The downside is that this is more distanced from the actual real usecase and it can lead to false positives.  
If you're using TypeScript it can help you in creating a correct Task mock:

```ts
const task = reactive<Partial<Task<any, any>>>({
  isRunning: true,
});
```
