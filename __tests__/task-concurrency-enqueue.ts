import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { wait } from "./task-cancel";
import { performNTimes } from "./task-concurrency-restartable";

describe("useTask | enqueue task", () => {
  test("runs the first task instance right away", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).enqueue();
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
    });
  });

  test("enqueues 2d and 3rd instance if the first one is running", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).enqueue();
      const instance1 = task.perform();
      const instance2 = task.perform();
      const instance3 = task.perform();

      expect(instance1.isRunning).toBe(true);
      expect(instance2.isEnqueued).toBe(true);
      expect(instance3.isEnqueued).toBe(true);

      expect(instance3.isRunning).toBe(false);
      expect(instance3.hasStarted).toBe(false);
      expect(instance3.isFinished).toBe(false);
      expect(instance3.isError).toBe(false);
    });
  });

  test("runs the first enqueued task if the running task finishes", async () => {
    await mockSetup(async () => {
      const task = useTask(function*(_, time) {
        yield wait(time);
      }).enqueue();
      const instance1 = task.perform(15);
      const instance2 = task.perform(15);
      const instance3 = task.perform(15);

      await instance1;

      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(false);

      await instance2;

      expect(instance3.isRunning).toBe(true);
    });
  });

  test("runs the first enqueued tasks if the running task finishes (maxConcurrency)", async () => {
    await mockSetup(async () => {
      const task = useTask(function*(_, index) {
        yield wait(index * 15);
      })
        .enqueue()
        .maxConcurrency(3);
      const [
        instance1,
        instance2,
        instance3,
        instance4,
        instance5,
        instance6,
        instance7,
      ] = performNTimes(task)(7);

      // first three instances running
      expect(instance1.isRunning).toBe(true);
      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(true);

      // rest enqueued
      expect(instance4.isEnqueued).toBe(true);
      expect(instance5.isEnqueued).toBe(true);
      expect(instance6.isEnqueued).toBe(true);
      expect(instance7.isEnqueued).toBe(true);

      // wait for instance2, leaving space for two enqueed tasks to start running
      await instance2;

      expect(instance4.isRunning).toBe(true);
      expect(instance5.isRunning).toBe(true);
      expect(instance6.isEnqueued).toBe(true);
      expect(instance7.isEnqueued).toBe(true);

      // again
      await instance4;

      expect(instance6.isRunning).toBe(true);
      expect(instance7.isRunning).toBe(true);
    });
  });
});
