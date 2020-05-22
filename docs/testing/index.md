# Testing

Encapsulation and consistence of tasks can make tests more straightforward. Components that accept tasks via props are quite easily tested.

There's two common approaches for testing such components.

## Passing actual tasks

You might be tempted to create e test like this, but this approach will not work:

```ts
describe("SaveButton", () => {
  it("is disabled when the task is running", () => {
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

[Github: allow useTask to be used outside of setup](https://github.com/MartinMalinda/vue-concurrency/issues/1)
