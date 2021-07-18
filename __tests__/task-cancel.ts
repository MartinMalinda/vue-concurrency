import { waitFor } from "@testing-library/dom";
import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";

describe("useTask cancel", () => {
  test("taskInstance.cancel results in isCanceled:true and no value", async () => {
    let reached2ndYield = false;
    await mockSetup(async () => {
      const task = useTask(function* () {
        yield wait(15);
        reached2ndYield = true;
        return "foo";
      });
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
      taskInstance.cancel();

      expect(taskInstance.isCanceling).toBe(true);
      await waitFor(() => expect(taskInstance.isCanceled).toBe(true), {
        interval: 10,
      });
      expect(taskInstance.isFinished).toBe(true);
      expect(taskInstance.isRunning).toBe(false);
      expect(taskInstance.isError).toBe(false);
      expect(taskInstance.isSuccessful).toBe(false);
      expect(taskInstance.value).toBe(null);
      expect(reached2ndYield).toBe(false);
    });
  });

  test("task.cancelAll cancels all running instances", async () => {
    await mockSetup(async () => {
      const task = useTask(function* () {
        return "foo";
      });
      const taskInstance1 = task.perform();
      const taskInstance2 = task.perform();
      try {
        await taskInstance1;
        await taskInstance2;
      } catch (e) {
        expect(e).toBe("cancel");
      }

      const taskInstance3 = task.perform();
      const taskInstance4 = task.perform();

      task.cancelAll();

      expect(taskInstance1.isCanceled).toBe(false);
      expect(taskInstance2.isCanceled).toBe(false);

      await waitFor(() => expect(taskInstance3.isCanceled).toBe(true));
      expect(taskInstance4.isCanceled).toBe(true);
    });
  });

  test("task.cancelAll with force works", async () => {
    await mockSetup(async () => {
      const task = useTask(function* () {
        return "foo";
      });
      
      task.perform();
      task.perform();

      task.cancelAll({ force: true });
    });
  });

  test("signal.pr is called when the task is canceled", async () => {
    const signalCatchCallback = jest.fn();
    await mockSetup(async () => {
      const task = useTask(function* (signal) {
        signal.pr.catch(signalCatchCallback);
        yield wait(30);
        return "foo";
      });
      const taskInstance = task.perform();
      await wait(5);
      taskInstance.cancel();

      await waitFor(() => expect(taskInstance.isFinished).toBe(true));
      expect(signalCatchCallback).toHaveBeenCalled();
    });
  });
});

export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
