import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { wait } from "./task-cancel";
import { perform3x } from "./task-concurrency-restartable";

describe("useTask | drop task", () => {
  test("runs the first task instance right away", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).drop();
      const instance = task.perform();
      expect(instance.isRunning).toBe(true);
    });
  });

  test("drops the second instance if the first isRunning", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).drop();
      const instance1 = task.perform();
      const instance2 = task.perform();
      expect(instance1.isRunning).toBe(true);

      expect(instance2.isDropped).toBe(true);
      expect(instance2.isRunning).toBe(false);
      expect(instance2.isFinished).toBe(false);
      expect(instance2.isSuccessful).toBe(false);
      expect(instance2.isCanceled).toBe(false);
      expect(instance2.isError).toBe(false);
      expect(instance2.hasStarted).toBe(false);
    });
  });

  test("allows new instance to run if there is no one already running", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {}).drop();
      const instance1 = task.perform();
      await instance1;
      const instance2 = task.perform();
      expect(instance2.isRunning).toBe(true);
    });
  });

  test("starts dropping instances once maxConcurrency is reached", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {})
        .drop()
        .maxConcurrency(3);
      const [instance1, instance2, instance3] = perform3x(task);

      expect(instance1.isRunning).toBe(true);
      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(true);

      const instance4 = task.perform();
      const instance5 = task.perform();

      expect(instance4.isDropped).toBe(true);
      expect(instance5.isDropped).toBe(true);
    });
  });

  test("allows multiple instances to run again with maxConcurrency if previous ones finished", async () => {
    await mockSetup(async () => {
      const task = useTask(function*(_, index: number) {
        yield wait(index * 15);
      })
        .drop()
        .maxConcurrency(3);
      const [_, instance2] = perform3x(task);

      await instance2;

      const [instance4, instance5, instance6] = perform3x(task);

      expect(instance4.isRunning).toBe(true);
      expect(instance5.isRunning).toBe(true);
      expect(instance6.isDropped).toBe(true);
    });
  });
});
