import { render } from "@testing-library/vue";
import Vue from "vue";
import useTask from "../src/Task";
import { createComponentStub } from "../test-utils/components";

export const mockSetup = async (cb): Promise<void> => {
  let _setupPromiseResolve;
  const setupPromise = new Promise(
    (resolve) => (_setupPromiseResolve = resolve)
  );
  const component = createComponentStub("TaskUsingComponent", async () => {
    await cb();
    _setupPromiseResolve();
  });

  render(component);
  await setupPromise;
  await Vue.nextTick();
};

describe("useTask | task with no instances", () => {
  test("isIdle if not performed", async () => {
    await mockSetup(() => {
      const task = useTask(function* () {});
      expect(task.isIdle).toBe(true);
      expect(task.isRunning).not.toBe(true);
    });
  });

  test("has performCount 0", async () => {
    await mockSetup(() => {
      const task = useTask(function* () {});
      expect(task.performCount).toBe(0);
    });
  });

  test("has `undefined` last (instance)", async () => {
    await mockSetup(() => {
      const task = useTask(function* () {});
      expect(task.last).toBe(undefined);
    });
  });

  test("has `undefined` lastSuccessful (instance)", async () => {
    await mockSetup(() => {
      const task = useTask(function* () {});
      expect(task.lastSuccessful).toBe(undefined);
    });
  });

  test("has `undefined` firstEnqueued (instance)", async () => {
    await mockSetup(() => {
      const task = useTask(function* () {});
      expect(task.firstEnqueued).toBe(undefined);
    });
  });
});
