import { reviveTaskInstance } from "../src/utils/ssr-utils";
import { TaskInstance } from "../src/TaskInstance";

describe("reviveTaskInstance", () => {
  it("creates deffered object that resolves", async () => {
    const taskInstance = {
      id: 1,
      value: "foo",
      error: null,
      isError: false,
      then: {},
      catch: {},
      finally: {},
      cancel: {},
      canceledOn: {},
      _deferredObject: {},
    } as TaskInstance<any>;
    reviveTaskInstance(taskInstance);

    const value = await taskInstance;
    expect(value).toBe("foo");
  });

  it("creates deffered object that rejects", async () => {
    const taskInstance = {
      id: 1,
      value: null,
      error: new Error("error"),
      isError: true,
      then: {},
      catch: {},
      finally: {},
      cancel: {},
      canceledOn: {},
      _deferredObject: {},
    } as TaskInstance<any>;
    reviveTaskInstance(taskInstance);

    let error;
    try {
      await taskInstance;
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe("error");
  });

  it("turns objects into noops", async () => {
    const taskInstance = {
      id: 1,
      value: "foo",
      error: null,
      isError: false,
      then: {},
      catch: {},
      finally: {},
      cancel: {},
      canceledOn: {},
      _deferredObject: {},
    } as TaskInstance<any>;
    reviveTaskInstance(taskInstance);

    expect(taskInstance.then(() => { })).toBeInstanceOf(Promise);
    expect(taskInstance.catch(() => { })).toBeInstanceOf(Promise);
    expect(taskInstance.finally(() => { })).toBeInstanceOf(Promise);
    expect(taskInstance.cancel()).toBe(undefined);
    expect(taskInstance.canceledOn({} as any)).toBe(taskInstance);
  });
});

// TODO: do some integration test for this:
// describe("useTaskPrefetch", () => {
//   it("saves instances to context on the server", async () => {
//     await mockSetup(() => {});
//   });
// });
