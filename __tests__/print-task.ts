import { mockSetup } from "../test-utils/components";
import useTask from "../src/Task";
import { printTask } from "../src/utils/general";

describe("printTask()", () => {
  it("prints to the console", async () => {
    await mockSetup(() => {
      const spy = jest.spyOn(console, "table");
      const task = useTask(function* () {
        return "foo";
      });
      task.perform();
      printTask(task);
      expect(spy).toHaveBeenCalled();
    });
  });
});
