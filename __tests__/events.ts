import globalEvents, {EventTarget} from "../src/utils/events";
import useTask, { Task } from "../src/Task";
import { wait } from "./task-cancel";
import { mockSetup } from "../test-utils/components";
import { TaskInstance } from "../src/TaskInstance";


describe("events", () => {
    it("adds event handler", async () => {
      const handler = () => {}
      const {addEvent, hasEvent} = globalEvents();
      const eventHandler = {
        target: EventTarget.OnError,
        key: "test",
        handler
      };
  
      addEvent(eventHandler);
  
      expect(hasEvent(eventHandler)).toBe(true);
    });

  it("adds & fires event handler", async () => {
    let fired = false;
    let taskInstance: null | TaskInstance<any> = null;
    
    const handler = () => {
        fired = true;
    };
    const eventHandler = {
      target: EventTarget.OnError,
      key: "test",
      handler
    };    
    const {addEvent, fireEvent} = globalEvents();

    await mockSetup(() => {
      const task = useTask(function*() {});
      taskInstance = task.perform();
    });
    expect(taskInstance).not.toBe(null);

    addEvent(eventHandler);

    fireEvent({target: EventTarget.OnError, eventArgs: {
        sender: taskInstance!
    }})

    expect(fired).toBe(true);
  });
});
