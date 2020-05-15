import { waitFor } from "@testing-library/vue";
import useTask from "../src/Task";
import { mockSetup } from "./task";
import { timeout } from "./task-cancel";

describe("useTask | multiple | task", () => {
  test("can yield instance of another task", async () => {
    await mockSetup(async () => {
      const childTask = useTask(function*() {
        yield timeout(20);
        return "foo";
      });
      const mainTask = useTask(function*() {
        const result = (yield childTask.perform()) as string;
        return (result + (yield childTask.perform())) as string;
      });

      mainTask.perform();

      await waitFor(() => expect(mainTask.last?.value).toBe("foofoo"));
    });
  });

  test("task picks up thrown error of another task", async () => {
    await mockSetup(async () => {
      const error = new Error("Task error");
      const childTask = useTask(function*() {
        throw error;
      });
      const mainTask = useTask(function*() {
        return yield childTask.perform();
      });

      mainTask.perform();

      await waitFor(() => expect(mainTask.last?.error).toBe(error));
    });
  });
});
