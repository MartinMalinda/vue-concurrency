import useTask from "../src/Task";
import { wait } from "./wait";
import { mockSetup } from "../test-utils/components";

describe("useTask", () => {
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

  test("has isError false if not performed", async () => {
    await mockSetup(async () => {
      const task = useTask(function* () {});
      expect(task.isError).toBe(false);
    });
  });

  test("has isError true if last instance has error", async () => {
    await mockSetup(async () => {
      const task = useTask(function* () {
        throw new Error("You shall not pass");
      });
      task.perform();
      await wait(50);
      expect(task.isError).toBe(true);
    });
  });

  test("can be cleared of its instances", async () => {
    await mockSetup(async () => {
      const task = useTask(function* () {
        return "foo";
      });

      task.perform();
      task.clear();

      expect(task._instances.length).toBe(0);
      expect(task.isRunning).toBe(false);
      expect(task.isIdle).toBe(true);

      // performCount is total performs, not history length
      expect(task.performCount).toBe(1);
    });
  });

  test("can be called without active component", async () => {
    const task = useTask(function* () {
      return "foo";
    });

    await task.perform();

    expect(task.last?.value).toBe("foo");
  });
});
