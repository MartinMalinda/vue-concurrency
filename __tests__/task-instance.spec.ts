import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";

describe("useTask | task instance", () => {
  test("has right value after finishing", async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        return "foo";
      });
      const taskInstance = task.perform();
      const result = await task.perform();
      expect(result).toBe("foo");
      expect(taskInstance.value).toBe("foo");
      expect(taskInstance.isFinished).toBe(true);
      expect(taskInstance.isSuccessful).toBe(true);
    });
  });

  test("has right error after finishing", async () => {
    const error = new Error("woah");
    await mockSetup(async () => {
      const taskInstance = useTask(function*() {
        throw error;
      }).perform();
      try {
        await taskInstance;
      } catch (caughtError) {
        expect(caughtError).toBe(error);
      }
      expect(taskInstance.error).toBe(error);
      expect(taskInstance.value).toBe(null);
      expect(taskInstance.isError).toBe(true);
      expect(taskInstance.isFinished).toBe(true);
      expect(taskInstance.isRunning).toBe(false);
      expect(taskInstance.isSuccessful).toBe(false);
    });
  });
});
