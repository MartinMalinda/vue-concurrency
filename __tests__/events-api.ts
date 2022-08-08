import { useTask, addEventHandler, removeEventHandler } from "../src/index";
import { EventTargetOptions } from "../src/types/index";
import { mockSetup } from "../test-utils/components";

describe("public events api", () => {
  test("using events api outside of a component", async () => {
    let fired = false;
    const handler = () => {
      fired = true;
    };

    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    addEventHandler(eventHandler);

    await mockSetup(() => {
      const task = useTask(function* () {
        throw "err";
      });
      task.perform();
    });

    expect(fired).toBe(true);
  });

  test("using events api inside a component", async () => {
    let fired = false;
    await mockSetup(() => {
      const handler = () => {
        fired = true;
      };

      const eventHandler = {
        target: EventTargetOptions.OnError,
        key: "test",
        handler,
      };

      addEventHandler(eventHandler);
    });

    await mockSetup(() => {
      const task = useTask(function* () {
        throw "err";
      });
      task.perform();
    });

    expect(fired).toBe(true);
  });

  it("fires only once with repeatedly adding same handler", async () => {
    let fired = 0;
    const handler = () => {
      fired++;
    };

    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    addEventHandler(eventHandler);
    addEventHandler(eventHandler);
    addEventHandler(eventHandler);

    await mockSetup(() => {
      const task = useTask(function* () {
        throw "err";
      });
      task.perform();
    });

    expect(fired).toBe(1);
  });

  test("clearing a handler from another component", async () => {
    let fired = false;
    await mockSetup(() => {
      const handler = () => {
        fired = true;
      };

      const eventHandler = {
        target: EventTargetOptions.OnError,
        key: "test",
        handler,
      };

      addEventHandler(eventHandler);
    });

    await mockSetup(() => {
      removeEventHandler({
        target: EventTargetOptions.OnError,
        key: "test",
      });
    });

    await mockSetup(() => {
      const task = useTask(function* () {
        throw "err";
      });
      task.perform();
    });

    expect(fired).toBe(false);
  });
});
