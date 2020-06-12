import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { wait } from "./task-cancel";
import { performNTimes, perform3x } from "./task-concurrency-restartable";

describe("useTask | keepLatest task", () => {
  test("runs the first task instance right away", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).keepLatest();
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
    });
  });

  test("drop 2d and enqueues 3rd instance if the first one is running", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).keepLatest();
      const [instance1, instance2, instance3] = perform3x(task);

      expect(instance1.isRunning).toBe(true);
      expect(instance2.isDropped).toBe(true);
      expect(instance3.isEnqueued).toBe(true);
    });
  });

  test("runs the first enqueued task if the running task finishes", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        yield wait(15);
      }).keepLatest();
      const [instance1, instance2, instance3] = perform3x(task);

      await instance1;

      expect(instance3.isRunning).toBe(true);

      await instance3;

      const [instance4, instance5, instance6] = perform3x(task);

      expect(instance4.isRunning).toBe(true);
      expect(instance5.isDropped).toBe(true);
      expect(instance6.isEnqueued).toBe(true);
    });
  });

  test("runs the first enqueued tasks if the running task finishes (maxConcurrency)", async () => {
    await mockSetup(async () => {
      const task = useTask(function*(_, index) {
        yield wait(index * 15);
      })
        .keepLatest()
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

      expect(instance1.isRunning).toBe(true);
      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(true);
      expect(instance4.isDropped).toBe(true);
      expect(instance5.isDropped).toBe(true);
      expect(instance6.isDropped).toBe(true);
      expect(instance7.isEnqueued).toBe(true);

      await instance2;

      expect(instance7.isRunning).toBe(true);

      await instance7;

      const [
        instance8,
        instance9,
        instance10,
        instance11,
        instance12,
      ] = performNTimes(task)(5);

      expect(instance8.isRunning).toBe(true);
      expect(instance9.isRunning).toBe(true);
      expect(instance10.isRunning).toBe(true);
      expect(instance11.isDropped).toBe(true);
      expect(instance12.isEnqueued).toBe(true);
    });
  });
});
