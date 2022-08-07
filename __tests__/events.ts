import globalEvents  from "../src/utils/events";
import { EventTargetOptions } from "../src/types/events"
import useTask, { Task } from "../src/Task";
import { mockSetup } from "../test-utils/components";
import { TaskInstance } from "../src/TaskInstance";


describe("events", () => {
    it("adds event handler", async () => {
      const handler = () => {}
      const {addEvent, hasEvent} = globalEvents();
      const eventHandler = {
        target: EventTargetOptions.OnError,
        key: "test",
        handler
      };
  
      addEvent(eventHandler);
  
      expect(hasEvent(eventHandler)).toBe(true);
    });
    
    it("removes event handler", async () => {
      const handler = () => {}
      const {addEvent, hasEvent, removeEvent} = globalEvents();
      const eventHandler = {
        target: EventTargetOptions.OnError,
        key: "test",
        handler
      };
  
      addEvent(eventHandler);

      removeEvent(eventHandler);
  
      expect(hasEvent(eventHandler)).toBe(false);
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
        handler
      };    
      const {addEvent, fireEvent, removeEvent} = globalEvents();
  
      await mockSetup(() => {
        const task = useTask(function*() {});
        taskInstance = task.perform();
      });
      expect(taskInstance).not.toBe(null);
  
      addEvent(eventHandler);
      removeEvent(eventHandler);
  
      fireEvent({target: EventTargetOptions.OnError, eventArgs: {
          sender: taskInstance!
      }})
  
      expect(fired).toBe(false);
    });
    
    it("clears event handler", async () => {
      const handler = () => {}
      const {addEvent, hasEvent, clearTargetEvents} = globalEvents();
      const eventHandler = {
        target: EventTargetOptions.OnError,
        key: "test",
        handler
      };
  
      addEvent(eventHandler);

      clearTargetEvents(eventHandler);
  
      expect(hasEvent(eventHandler)).toBe(false);
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
        handler
      };    
      const {addEvent, fireEvent, clearTargetEvents} = globalEvents();
  
      await mockSetup(() => {
        const task = useTask(function*() {});
        taskInstance = task.perform();
      });
      expect(taskInstance).not.toBe(null);
  
      addEvent(eventHandler);
      clearTargetEvents(eventHandler);
  
      fireEvent({target: EventTargetOptions.OnError, eventArgs: {
          sender: taskInstance!
      }})
  
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
      handler
    };    
    const {addEvent, fireEvent} = globalEvents();

    await mockSetup(() => {
      const task = useTask(function*() {});
      taskInstance = task.perform();
    });
    expect(taskInstance).not.toBe(null);

    addEvent(eventHandler);

    fireEvent({target: EventTargetOptions.OnError, eventArgs: {
        sender: taskInstance!
    }})

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
      handler
    };    
    const {addEvent} = globalEvents();

    addEvent(eventHandler);

    await mockSetup(() => {
      const task = useTask(function*() { throw "err"; });
      taskInstance = task.perform();
    });

    expect(fired).toBe(true);
  });
});
