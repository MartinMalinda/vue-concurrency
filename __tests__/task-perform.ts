import useTask from "../src/Task";
import { wait } from "./task-cancel";
import { mockSetup } from "../test-utils/components";

describe("useTask | task perform", () => {
  test("returns a task instance", async () => {
    await mockSetup(() => {
      const task = useTask(function*() {});
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
    });
  });

  test("task.isRunning is set back to false when all the instances finish", async () => {
    await mockSetup(async () => {
      const waitTask = useTask(function*(signal, time) {
        yield wait(time);
      });
      const taskInstance1 = waitTask.perform(5);
      const taskInstance2 = waitTask.perform(10);
      const taskInstance3 = waitTask.perform(20);
      expect(waitTask.isRunning).toBe(true);
      expect(waitTask.isIdle).toBe(false);

      await taskInstance1;

      expect(waitTask.isRunning).toBe(true);
      expect(waitTask.isIdle).toBe(false);

      await taskInstance2;

      expect(waitTask.isRunning).toBe(true);
      expect(waitTask.isIdle).toBe(false);

      await taskInstance3;

      expect(waitTask.isRunning).toBe(false);
      expect(waitTask.isIdle).toBe(true);
    });
  });

  test("can be awaited", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        return "foo";
      });
      const result = await task.perform();
      expect(result).toBe("foo");
    });
  });

  test("can be used as a promise (then)", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        return "foo";
      });
      const foo = await task.perform().then((taskInstanceValue) => {
        expect(taskInstanceValue).toBe("foo");
        return "bar";
      });
      expect(foo).toBe("bar");
    });
  });

  test("can be used as a promise (then - chaining)", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        return Promise.resolve("foo");
      });
      const foo = await task
        .perform()
        .then((taskInstanceValue) => {
          expect(taskInstanceValue).toBe("foo");
          return "bar";
        })
        .then((chainedValue) => {
          expect(chainedValue).toBe("bar");
          return "baz";
        });
      expect(foo).toBe("baz");
    });
  });

  test("can be used as a promise (catch)", async () => {
    const error = new Error("Woah");
    let catchCbCalled = false;
    await mockSetup(async () => {
      const task = useTask(function*() {
        throw error;
      });
      await task.perform().catch((caughtError) => {
        catchCbCalled = true;
        expect(caughtError).toBe(error);
      });

      expect(catchCbCalled).toBe(true);
    });
  });

  test("can be used as a promise (catch - chaining)", async () => {
    const error = new Error("Woah");
    let catchCbCalled = false;
    await mockSetup(async () => {
      const task = useTask(function*() {
        throw error;
      });
      await task
        .perform()
        .then(() => {
          console.log("then");
          return "foo";
        })
        .catch((caughtError) => {
          catchCbCalled = true;
          expect(caughtError).toBe(error);
        });

      expect(catchCbCalled).toBe(true);
    });
  });

  test("can be awaited when already whinished", async () => {
    await mockSetup(async () => {
      const taskInstance = useTask(function*() {
        return "foo";
      }).perform();

      const foo1 = await taskInstance;
      const foo2 = await taskInstance;

      expect(foo1).toBe("foo");
      expect(foo2).toBe("foo");
    });
  });

  test("makes performCount increase", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {});
      task.perform();
      task.perform();

      expect(task.performCount).toBe(2);
    });
  });

  test("allows last to be accessed", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {});
      task.perform();
      const taskInstance2 = task.perform();
      expect(task.last).toBe(taskInstance2);
    });
  });

  test("allows lastSuccessful to be accessed", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {});
      task.perform();
      const taskInstance2 = task.perform();
      expect(task.lastSuccessful).toBe(undefined);
      await taskInstance2;
      expect(task.lastSuccessful).toBe(taskInstance2);
    });
  });

  test("returns a taskInstance that isRunning", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {});
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
      expect(task.isRunning).toBe(true);
      expect(taskInstance.isFinished).toBe(false);
    });
  });

  test("passes arguments to the generator function along with abort signal", async () => {
    let taskCallbackCalled = false;
    await mockSetup(async () => {
      const task = useTask(function*(signal, argA, argB) {
        taskCallbackCalled = true;
        expect(signal).toBeInstanceOf(AbortSignal);
        expect(argA).toBe("foo");
        expect(argB).toBe("bar");
      });
      task.perform("foo", "bar");
      expect(taskCallbackCalled).toBe(true);
    });
  });
});
