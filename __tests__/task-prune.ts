import useTask from "../src/Task";
import { wait } from "./wait";
import { mockSetup } from "../test-utils/components";

describe("useTask | history pruning", () => {
  test("prunes completed instances lazily when idle, keeping last + last 2 successful", async () => {
    await mockSetup(async () => {
      // Each perform finishes quickly.
      const task = useTask(function* () {
        yield wait(1);
        return "ok";
      });

      const i1 = task.perform();
      const i2 = task.perform();
      const i3 = task.perform();
      const i4 = task.perform();

      await i1;
      await i2;
      await i3;
      await i4;

      // Before prune delay, history is still present.
      expect(task._instances.length).toBe(4);

      // Wait for prune debounce (1s) + a tiny buffer.
      await wait(1010);

      // Should keep last (i4) + last 2 successful (i4, i3) => effectively i3 & i4.
      // (Implementation also keeps last, which is i4, so still 2 total.)
      expect(task._instances.length).toBe(2);
      expect(task._instances).toContain(i3);
      expect(task._instances).toContain(i4);
      expect(task._instances).not.toContain(i1);
      expect(task._instances).not.toContain(i2);

      // Sanity: lastSuccessful should still be i4.
      expect(task.lastSuccessful).toBe(i4);
    });
  });

  test("does not prune while there are enqueued instances; prunes after fully idle", async () => {
    await mockSetup(async () => {
      // Make tasks take long enough that we can observe the enqueued state.
      const task = useTask(function* (signal, time: number) {
        yield wait(time);
        return "ok";
      }).keepLatest();

      const i1 = task.perform(30);
      const i2 = task.perform(30);
      const i3 = task.perform(30);

      // With keepLatest at maxConcurrency=1, later performs enqueue.
      expect(task._enqueuedInstances.length).toBeGreaterThan(0);

      // Wait past prune delay; should NOT prune because still not fully idle (enqueued/running).
      await wait(1010);
      expect(task._instances.length).toBe(3);

      // Let everything finish.
      await i1;
      await i2;
      await i3;

      // Now allow prune to run on idle.
      await wait(1010);

      // Keep last 2 successful (and last) => i2 & i3, or i3 & i2 depending on completion order.
      // In this flow, they should finish in perform order.
      expect(task._instances.length).toBe(2);
      expect(task._instances).toContain(i2);
      expect(task._instances).toContain(i3);
      expect(task._instances).not.toContain(i1);
    });
  });

  test("can disable pruning via pruneHistory: false", async () => {
    await mockSetup(async () => {
      const task = useTask(
        function* () {
          yield wait(1);
          return "ok";
        },
        { pruneHistory: false },
      );

      const i1 = task.perform();
      const i2 = task.perform();
      const i3 = task.perform();

      await i1;
      await i2;
      await i3;

      await wait(1010);

      // No pruning: all instances remain.
      expect(task._instances.length).toBe(3);
      expect(task._instances).toContain(i1);
      expect(task._instances).toContain(i2);
      expect(task._instances).toContain(i3);
    });
  });
});
