import { createApp, defineComponent } from "vue";
import useTask from "../src/Task";
import { VueConcurrencyConfig } from "../src/config";
import { wait } from "./wait";

describe("useTask config", () => {
  test("useTask picks up app-provided defaults", async () => {
    const Comp = defineComponent({
      setup() {
        const task = useTask(function* () {
          yield wait(1);
          return "ok";
        });

        // return internals for assertions
        return { task };
      },
      template: "<div />",
    });

    const app = createApp(Comp);
    app.use(VueConcurrencyConfig, {
      taskDefaults: { maxInstances: 5, pruneDelayMs: 10 },
    });

    const el = document.createElement("div");
    document.body.appendChild(el);
    const vm: any = app.mount(el);

    const { task } = vm;
    expect(task._maxInstances).toBe(5);
    expect(task._pruneDelayMs).toBe(10);

    app.unmount();
    el.remove();
  });

  test("per-task options override injected defaults", async () => {
    const Comp = defineComponent({
      setup() {
        const task = useTask(
          function* () {
            yield wait(1);
            return "ok";
          },
          { maxInstances: 2 }
        );

        return { task };
      },
      template: "<div />",
    });

    const app = createApp(Comp);
    app.use(VueConcurrencyConfig, {
      taskDefaults: { maxInstances: 5, pruneDelayMs: 10 },
    });

    const el = document.createElement("div");
    document.body.appendChild(el);
    const vm: any = app.mount(el);

    const { task } = vm;
    expect(task._maxInstances).toBe(2);
    expect(task._pruneDelayMs).toBe(10); // not overridden

    app.unmount();
    el.remove();
  });

  test("without plugin, library defaults apply", async () => {
    const Comp = defineComponent({
      setup() {
        const task = useTask(function* () {
          yield wait(1);
          return "ok";
        });

        return { task };
      },
      template: "<div />",
    });

    const app = createApp(Comp);
    // no plugin

    const el = document.createElement("div");
    document.body.appendChild(el);
    const vm: any = app.mount(el);

    const { task } = vm;
    expect(task._maxInstances).toBe(50);
    expect(task._pruneDelayMs).toBe(1000);

    app.unmount();
    el.remove();
  });
});