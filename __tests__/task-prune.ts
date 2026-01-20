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
        { pruneHistory: false }
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

test("respects keepSuccessful option", async () => {
  await mockSetup(async () => {
    const task = useTask(
      function* () {
        yield wait(1);
        return "ok";
      },
      { keepSuccessful: 3 }
    );

    const i1 = task.perform();
    const i2 = task.perform();
    const i3 = task.perform();
    const i4 = task.perform();

    await i1;
    await i2;
    await i3;
    await i4;

    await wait(1010);

    // keep last (i4) + last 3 successful => i2, i3, i4
    expect(task._instances.length).toBe(3);
    expect(task._instances).toContain(i2);
    expect(task._instances).toContain(i3);
    expect(task._instances).toContain(i4);
    expect(task._instances).not.toContain(i1);
  });
});

test("respects pruneDelayMs option", async () => {
  await mockSetup(async () => {
    const task = useTask(
      function* () {
        yield wait(1);
        return "ok";
      },
      { pruneDelayMs: 50 }
    );

    const i1 = task.perform();
    const i2 = task.perform();
    const i3 = task.perform();

    await i1;
    await i2;
    await i3;

    // before 50ms, should not prune yet (give it a tiny moment)
    expect(task._instances.length).toBe(3);

    await wait(70);

    // keep last + last 2 successful => i2, i3
    expect(task._instances.length).toBe(2);
    expect(task._instances).toContain(i2);
    expect(task._instances).toContain(i3);
    expect(task._instances).not.toContain(i1);
  });
});

test("enforces maxInstances cap by pruning finished non-anchors even under constant activity", async () => {
  await mockSetup(async () => {
    const task = useTask(
      function* () {
        // finish quickly
        yield wait(1);
        return "ok";
      },
      {
        maxInstances: 5,
        pruneDelayMs: 10_000, // effectively disable idle pruning for this test
      }
    );

    // Keep the task busy: start new performs frequently, but let them finish.
    // We intentionally don't wait for the idle-prune path.
    const instances: any[] = [];
    for (let i = 0; i < 12; i++) {
      instances.push(task.perform());
      await wait(2);
    }

    // Ensure all have finished so they are eligible for cap pruning.
    await Promise.all(instances);

    // Cap prune runs during perform() once length > maxInstances.
    // After settling, we should not have unbounded growth.
    expect(task._instances.length).toBeLessThanOrEqual(5);

    // Anchors should remain: last + last 2 successful.
    const last = instances[instances.length - 1];
    const prev1 = instances[instances.length - 2];
    const prev2 = instances[instances.length - 3];

    expect(task._instances).toContain(last);
    expect(task._instances).toContain(prev1);
    expect(task._instances).toContain(prev2);
  });
});

test("options merge: passing partial options keeps other defaults (e.g. pruneHistory stays on)", async () => {
  await mockSetup(async () => {
    const task = useTask(
      function* () {
        yield wait(1);
        return "ok";
      },
      { cancelOnUnmount: false }
    );

    const i1 = task.perform();
    const i2 = task.perform();
    const i3 = task.perform();

    await i1;
    await i2;
    await i3;

    await wait(1010);

    // pruneHistory default should still apply: keep last + last 2 successful => i2, i3
    expect(task._instances.length).toBe(2);
    expect(task._instances).toContain(i2);
    expect(task._instances).toContain(i3);
    expect(task._instances).not.toContain(i1);
  });
});
