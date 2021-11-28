import { mockSetup } from "../test-utils/components";
import useTaskGroup from "../src/TaskGroup";
import { wait } from "./task-cancel";
import useTask from "../src/Task";

describe("useTaskGroup", () => {
  test("has correct initial state state", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const add10Task = useTask(function*(signal, a: number) {
        return a + 10;
      });
      const add20Task = useTask(function*(signal, a: number) {
        return a + 20;
      });
      const taskGroup = useTaskGroup({
        addTask,
        add10Task,
        add20Task,
      });

      expect(taskGroup).toStrictEqual({
        addTask,
        add10Task,
        add20Task,
        isRunning: false,
        isIdle: true,
        isError: false,
      });
    });
  });

  test("isRunning changes when a child task is performed", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        yield wait(50);
        return a + b;
      });
      const add10Task = useTask(function*(signal, a: number) {
        return a + 10;
      });
      const add20Task = useTask(function*(signal, a: number) {
        return a + 20;
      });
      const taskGroup = useTaskGroup({
        addTask,
        add10Task,
        add20Task,
      });

      const instance = addTask.perform(100, 200);

      expect(taskGroup.isRunning).toBe(true);

      await instance;

      expect(taskGroup.isRunning).toBe(false);
    });
  });
});

// TODO: test cancelation cascade
