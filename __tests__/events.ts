import {
  addEventHandler,
  hasEventHandler,
  removeEventHandler,
  clearTargetEventHandlers,
  fireEvent,
} from "../src/utils/events";
import { EventTargetOptions } from "../src/types/events";
import useTask from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { TaskInstance } from "../src/TaskInstance";

describe("events", () => {
  it("adds event handler", async () => {
    const handler = () => {};
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    addEventHandler(eventHandler);

    expect(hasEventHandler(eventHandler)).toBe(true);
  });

  it("removes event handler", async () => {
    const handler = () => {};
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    addEventHandler(eventHandler);

    removeEventHandler(eventHandler);

    expect(hasEventHandler(eventHandler)).toBe(false);
  });

  test("removed event doesn't fire", async () => {
    let fired = false;
    let taskInstance: null | TaskInstance<any> = null;

    const handler = () => {
      fired = true;
    };
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    await mockSetup(() => {
      const task = useTask(function* () {});
      taskInstance = task.perform();
    });
    expect(taskInstance).not.toBe(null);

    addEventHandler(eventHandler);
    removeEventHandler(eventHandler);

    fireEvent({
      target: EventTargetOptions.OnError,
      eventArgs: {
        sender: taskInstance!,
      },
    });

    expect(fired).toBe(false);
  });

  it("clears event handler", async () => {
    const handler = () => {};
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    addEventHandler(eventHandler);

    clearTargetEventHandlers(eventHandler);

    expect(hasEventHandler(eventHandler)).toBe(false);
  });

  test("cleared event doesn't fire", async () => {
    let fired = false;
    let taskInstance: null | TaskInstance<any> = null;

    const handler = () => {
      fired = true;
    };
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    await mockSetup(() => {
      const task = useTask(function* () {});
      taskInstance = task.perform();
    });
    expect(taskInstance).not.toBe(null);

    addEventHandler(eventHandler);
    clearTargetEventHandlers(eventHandler);

    fireEvent({
      target: EventTargetOptions.OnError,
      eventArgs: {
        sender: taskInstance!,
      },
    });

    expect(fired).toBe(false);
  });

  it("adds & fires event handler", async () => {
    let fired = false;
    let taskInstance: null | TaskInstance<any> = null;

    const handler = () => {
      fired = true;
    };
    const eventHandler = {
      target: EventTargetOptions.OnError,
      key: "test",
      handler,
    };

    await mockSetup(() => {
      const task = useTask(function* () {});
      taskInstance = task.perform();
    });
    expect(taskInstance).not.toBe(null);

    addEventHandler(eventHandler);

    fireEvent({
      target: EventTargetOptions.OnError,
      eventArgs: {
        sender: taskInstance!,
      },
    });

    expect(fired).toBe(true);
  });

  test("error event handler fires", async () => {
    let fired = false;
    let taskInstance: null | TaskInstance<any> = null;

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
      taskInstance = task.perform();
    });

    expect(fired).toBe(true);
  });
});
