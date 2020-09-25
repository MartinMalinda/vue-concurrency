import { waitFor } from "@testing-library/dom";
import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { wait } from "./task-cancel";
import { YieldReturn } from "../src/types/index";

describe("useTask | multiple | task", () => {
  test("can yield instance of another task", async () => {
    await mockSetup(async () => {
      const childTask = useTask(function* () {
        yield wait(20);
        return "foo";
      });
      const mainTask = useTask(function* () {
        const a: YieldReturn<typeof childTask> = yield childTask.perform();
        const b: YieldReturn<typeof childTask> = yield childTask.perform();
        return a + b;
      });

      mainTask.perform();

      await waitFor(() => expect(mainTask.last?.value).toBe("foofoo"));
    });
  });

  test("task picks up thrown error of another task", async () => {
    await mockSetup(async () => {
      const error = new Error("Task error");
      const childTask = useTask(function* () {
        throw error;
      });
      const mainTask = useTask(function* () {
        return yield childTask.perform();
      });

      mainTask.perform();

      await waitFor(() => expect(mainTask.last?.error).toBe(error));
    });
  });
});
