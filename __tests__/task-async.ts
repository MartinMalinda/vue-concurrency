import { mockSetup } from "../test-utils/components";
import { useAsyncTask } from "../src/utils/general";
import { wait } from "./task-cancel";

describe("useAsyncTask", () => {
  test("works", async () => {
    await mockSetup(() => {
      const task = useAsyncTask(async () => { });
      expect(task.isIdle).toBe(true);
    });
  });

  test("can be performed", async () => {
    await mockSetup(async () => {
      const task = useAsyncTask(async (signal, a: number, b: number) => {
        expect(signal).toBeInstanceOf(AbortSignal);
        await wait(10);
        return a + b;
      });

      const result = await task.perform(10, 5);
      expect(result).toBe(15);
    });
  });
});
